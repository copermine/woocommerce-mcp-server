import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createApp } from '../build/http.js';
import { createVerifier } from '../build/auth.js';
import { loadHttpConfig } from '../build/config.js';
import { catalog } from '../build/catalog.js';

let privateKey, config, api, http, writable, base, writeBase, keys;
const calls = [];
async function listen(server) {
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  return `http://127.0.0.1:${server.address().port}`;
}
async function token(overrides = {}, options = {}) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ iss: config.issuer, aud: `${config.publicUrl}/mcp`, sub: 'auth0|owner', iat: now, exp: now + 600, scope: 'woocommerce:read', ...overrides })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).sign(options.key || privateKey);
}
async function rpc(name, args, jwt, url = base) {
  const response = await fetch(`${url}/mcp`, { method: 'POST', headers: {
    'Content-Type': 'application/json', Accept: 'application/json, text/event-stream',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: name, params: args }) });
  return { status: response.status, headers: response.headers, body: await response.json() };
}
before(async () => {
  ({ privateKey, publicKey: keys } = await generateKeyPair('RS256'));
  keys = createLocalJWKSet({ keys: [{ ...await exportJWK(keys), kid: 'test-key', alg: 'RS256', use: 'sig' }] });
  api = createServer(async (req, res) => {
    let body = ''; for await (const part of req) body += part;
    calls.push({ method: req.method, url: req.url, auth: req.headers.authorization, body });
    res.setHeader('Content-Type', 'application/json');
    if (req.url.includes('search=fail')) {
      res.statusCode = 400; res.end(JSON.stringify({ message: 'Failure fake-consumer-secret' }));
    } else if (req.url.includes('search=redirect')) {
      res.statusCode = 302; res.setHeader('Location', '/must-not-follow'); res.end('{}');
    } else res.end(JSON.stringify([{ id: 1, name: 'Test product' }]));
  });
  const siteUrl = await listen(api);
  config = { siteUrl, consumerKey: 'fake-consumer-key', consumerSecret: 'fake-consumer-secret', enableWrites: false,
    publicUrl: 'https://mcp.example.test', issuer: 'https://identity.example.test/', jwksUrl: 'https://identity.example.test/jwks',
    allowedSubjects: ['auth0|owner'], port: 3000 };
  http = createServer(createApp(config, createVerifier(config, keys))); base = await listen(http);
  writable = createServer(createApp({ ...config, enableWrites: true }, createVerifier(config, keys))); writeBase = await listen(writable);
});
after(async () => {
  await Promise.all([api, http, writable].map(server => new Promise(resolve => server.close(resolve))));
});

test('health and OAuth discovery expose resource, issuer and scopes without credentials', async () => {
  assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok' });
  for (const path of ['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp']) {
    const metadata = await (await fetch(base + path)).json();
    assert.equal(metadata.resource, `${config.publicUrl}/mcp`);
    assert.deepEqual(metadata.authorization_servers, [config.issuer]);
    assert.deepEqual(metadata.scopes_supported, ['woocommerce:read']);
    assert.ok(!JSON.stringify(metadata).includes(config.consumerSecret));
  }
});
test('missing and malformed tokens receive a discovery challenge', async () => {
  for (const jwt of [undefined, 'not-a-token']) {
    const result = await rpc('tools/list', {}, jwt);
    assert.equal(result.status, 401);
    assert.match(result.headers.get('www-authenticate'), /resource_metadata="https:\/\/mcp.example.test\/.well-known\/oauth-protected-resource\/mcp"/);
  }
});
test('wrong issuer, audience, user, missing expiry, expired and future tokens are rejected', async () => {
  for (const overrides of [{ iss: 'https://wrong.test/' }, { aud: 'other' }, { sub: 'auth0|stranger' }, { exp: undefined }, { exp: 1 }, { nbf: Math.floor(Date.now()/1000)+3600 }]) {
    assert.equal((await rpc('tools/list', {}, await token(overrides))).status, 401);
  }
  const other = await generateKeyPair('RS256');
  assert.equal((await rpc('tools/list', {}, await token({}, { key: other.privateKey }))).status, 401);
});
test('read scope is mandatory, and hostile browser origins are rejected', async () => {
  assert.equal((await rpc('tools/list', {}, await token({ scope: 'woocommerce:write' }))).status, 403);
  const response = await fetch(`${base}/mcp`, { method: 'POST', headers: { Origin: 'https://attacker.test', Authorization: `Bearer ${await token()}` } });
  assert.equal(response.status, 403);
});
test('real MCP client initializes, lists tools and calls the configured WooCommerce store', async () => {
  const client = new Client({ name: 'integration-test', version: '1' });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`), { requestInit: { headers: { Authorization: `Bearer ${await token()}` } } }));
  try {
    const { tools } = await client.listTools();
    assert.ok(tools.length > 40);
    assert.ok(tools.every(t => t.name.startsWith('get_')));
    assert.ok(!tools.some(t => t.name === 'get_posts'));
    assert.ok(tools.every(t => t.inputSchema.additionalProperties === false));
    assert.ok(tools.every(t => !['siteUrl','consumerKey','consumerSecret','username','password'].some(k => k in (t.inputSchema.properties || {}))));
    assert.deepEqual(tools.find(t => t.name === 'get_products')._meta.securitySchemes, [{ type: 'oauth2', scopes: ['woocommerce:read'] }]);
    const result = await client.callTool({ name: 'get_products', arguments: { perPage: 2, filters: { search: 'table' } } });
    assert.equal(JSON.parse(result.content[0].text)[0].name, 'Test product');
    const call = calls.at(-1);
    assert.equal(call.method, 'GET');
    assert.match(call.url, /\/wp-json\/wc\/v3\/products\?/);
    assert.match(call.url, /per_page=2/);
    assert.match(call.url, /search=table/);
    assert.equal(call.auth, `Basic ${Buffer.from('fake-consumer-key:fake-consumer-secret').toString('base64')}`);
    assert.ok(!call.url.includes('consumer'));
  } finally { await client.close(); }
});
test('destinations, path traversal, oversized pages and disabled writes cannot reach WooCommerce', async () => {
  const jwt = await token();
  for (const [name, args] of [
    ['get_products', { siteUrl: 'https://attacker.test' }],
    ['get_products', { consumerKey: 'override' }],
    ['get_product', { productId: '../orders' }],
    ['get_product_meta', { productId: 1, metaKey: '..' }],
    ['get_products', { perPage: 101 }],
    ['get_products', { filters: { per_page: 500 } }],
    ['get_products', { filters: { consumer_secret: 'override' } }],
    ['get_payment_gateway', { gatewayId: '../settings' }],
    ['delete_product', { productId: 1 }],
  ]) {
    const before = calls.length;
    const result = await rpc('tools/call', { name, arguments: args }, jwt);
    assert.equal(result.body.result.isError, true, name);
    assert.equal(calls.length, before, name);
  }
});
test('write tools require both the deployment flag and write scope', async () => {
  const before = calls.length;
  const denied = await rpc('tools/call', { name: 'update_product', arguments: { productId: 1, productData: { name: 'Updated' } } }, await token(), writeBase);
  assert.equal(denied.body.result.isError, true);
  assert.match(denied.body.result._meta['mcp/www_authenticate'][0], /woocommerce:write/);
  assert.equal(calls.length, before);
  const allowed = await rpc('tools/call', { name: 'update_product', arguments: { productId: 1, productData: { name: 'Updated' } } }, await token({ scope: 'woocommerce:read woocommerce:write' }), writeBase);
  assert.ok(!allowed.body.result.isError);
  assert.equal(calls.at(-1).method, 'PUT');
  assert.equal(calls.at(-1).url, '/wp-json/wc/v3/products/1');
});
test('store errors redact credentials and redirects are not followed', async () => {
  const jwt = await token();
  const failed = await rpc('tools/call', { name: 'get_products', arguments: { filters: { search: 'fail' } } }, jwt);
  assert.equal(failed.body.result.isError, true);
  assert.ok(!JSON.stringify(failed.body).includes(config.consumerSecret));
  const before = calls.length;
  const redirect = await rpc('tools/call', { name: 'get_products', arguments: { filters: { search: 'redirect' } } }, jwt);
  assert.equal(redirect.body.result.isError, true);
  assert.equal(calls.length, before + 1);
});
test('default shipping zone ID 0 works and force=false is preserved', async () => {
  const jwt = await token({ scope: 'woocommerce:read woocommerce:write' });
  const result = await rpc('tools/call', { name: 'get_shipping_zone', arguments: { zoneId: 0 } }, jwt);
  assert.ok(!result.body.result.isError);
  assert.equal(calls.at(-1).url, '/wp-json/wc/v3/shipping/zones/0');
  await rpc('tools/call', { name: 'delete_product_tag', arguments: { tagId: 1, force: false } }, jwt, writeBase);
  assert.match(calls.at(-1).url, /force=false/);
});
test('malformed JSON and unsupported HTTP methods have predictable responses', async () => {
  const headers = { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' };
  assert.equal((await fetch(`${base}/mcp`, { method: 'POST', headers, body: '{' })).status, 400);
  assert.equal((await fetch(`${base}/mcp`, { headers })).status, 405);
});
test('catalog covers the upstream methods and metadata aliases have required inputs', async () => {
  const source = await readFile(new URL('../src/api.ts', import.meta.url), 'utf8');
  const names = [...source.matchAll(/case "(\w+)":/g)].map(m => m[1]);
  assert.equal(names.length, 119);
  assert.deepEqual(catalog.map(t => t.name), names);
  for (const entity of ['product','order','customer']) {
    for (const action of ['create','update']) {
      assert.deepEqual(catalog.find(t => t.name === `${action}_${entity}_meta`).required.sort(), [`${entity}Id`, 'metaKey', 'metaValue'].sort());
    }
  }
});
test('startup fails closed without OAuth owner configuration', () => {
  const env = { PUBLIC_URL: 'https://mcp.example.test', WORDPRESS_SITE_URL: 'https://shop.example.test', WOOCOMMERCE_CONSUMER_KEY: 'key', WOOCOMMERCE_CONSUMER_SECRET: 'secret', OAUTH_ISSUER: config.issuer, OAUTH_JWKS_URL: config.jwksUrl, OAUTH_ALLOWED_SUBJECTS: 'auth0|owner' };
  assert.equal(loadHttpConfig(env).enableWrites, false);
  for (const value of ['', '*']) assert.throws(() => loadHttpConfig({ ...env, OAUTH_ALLOWED_SUBJECTS: value }));
  assert.throws(() => loadHttpConfig({ ...env, PUBLIC_URL: 'http://mcp.example.test' }));
  assert.throws(() => loadHttpConfig({ ...env, PUBLIC_URL: 'https://mcp.example.test/mcp' }));
  assert.throws(() => loadHttpConfig({ ...env, ENABLE_WRITE_TOOLS: 'yes' }));
});
test('stdio entry point supports real MCP initialization and discovery', async () => {
  const client = new Client({ name: 'stdio-test', version: '1' });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ['build/index.js'], env: {
    WORDPRESS_SITE_URL: 'https://shop.example.test', WOOCOMMERCE_CONSUMER_KEY: 'fake-key', WOOCOMMERCE_CONSUMER_SECRET: 'fake-secret',
  }, stderr: 'pipe' }));
  try { assert.ok((await client.listTools()).tools.some(t => t.name === 'get_products')); }
  finally { await client.close(); }
});

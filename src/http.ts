import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { pathToFileURL } from 'node:url';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import type { OAuthTokenVerifier } from '@modelcontextprotocol/sdk/server/auth/provider.js';
import { loadHttpConfig, type HttpConfig } from './config.js';
import { createVerifier, metadataUrl, resourceUrl, READ_SCOPE, WRITE_SCOPE } from './auth.js';
import { createMcpServer } from './mcp.js';

export function createApp(config: HttpConfig, verifier: OAuthTokenVerifier = createVerifier(config)) {
  const app = express();
  app.disable('x-powered-by');
  // Railway terminates TLS at its reverse proxy. Do not trust arbitrary chains.
  app.set('trust proxy', 1);
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  const metadata = {
    resource: resourceUrl(config),
    authorization_servers: [config.issuer],
    scopes_supported: config.enableWrites ? [READ_SCOPE, WRITE_SCOPE] : [READ_SCOPE],
    bearer_methods_supported: ['header'],
    resource_name: 'WooCommerce',
  };
  app.get(['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp'], (_req, res) => res.json(metadata));
  app.use('/mcp', (req, res, next) => {
    // Browser origins must match this deployment; ChatGPT server requests have no Origin.
    if (req.headers.origin && req.headers.origin !== config.publicUrl) {
      res.status(403).json({ error: 'Origin not allowed' }); return;
    }
    next();
  });
  app.use('/mcp', rateLimit({ windowMs: 60000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.use('/mcp', requireBearerAuth({ verifier, requiredScopes: [READ_SCOPE], resourceMetadataUrl: metadataUrl(config) }));
  app.use('/mcp', express.json({ limit: '512kb' }));
  app.post('/mcp', async (req, res) => {
    // Stateless transport survives Railway restarts and needs no session database.
    const server = createMcpServer(config, metadataUrl(config));
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => { void server.close().catch(() => {}); });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch {
      if (!res.headersSent) res.status(500).json({ error: 'MCP request failed' });
    }
  });
  app.all('/mcp', (_req, res) => res.set('Allow', 'POST').status(405).json({ error: 'Use POST for stateless Streamable HTTP' }));
  app.use((error: { type?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (!res.headersSent) res.status(error.type === 'entity.too.large' ? 413 : 400).json({ error: 'Invalid request body' });
  });
  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const config = loadHttpConfig();
    const listener = createApp(config).listen(config.port, '0.0.0.0', () => {
      console.error(`WooCommerce MCP listening on port ${config.port}; writes ${config.enableWrites ? 'enabled' : 'disabled'}`);
    });
    const shutdown = () => {
      listener.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 10000).unref();
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Invalid server configuration');
    process.exit(1);
  }
}

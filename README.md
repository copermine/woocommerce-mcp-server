# WooCommerce MCP for Railway and ChatGPT

Deploy this fork as a remote **Streamable HTTP MCP server** with OAuth. The original WooCommerce/WordPress API integration is retained, with standards-compliant MCP discovery and calls added via the official TypeScript SDK.

**[Инструкции на български: Railway → Auth0 → ChatGPT](docs/RAILWAY_CHATGPT_BG.md)**

## Deployment

1. Deploy this repository on Railway. Its Dockerfile builds the server and runs the integration tests.
2. Generate a public domain; the MCP endpoint is `https://YOUR-DOMAIN/mcp`.
3. Configure an OAuth identity provider (Auth0 example in the guide) with RS256 tokens whose audience is that exact endpoint.
4. Set the variables from [.env.example](.env.example) in Railway, including the allowed OAuth user IDs.
5. Create a ChatGPT developer-mode app with the MCP URL and OAuth authentication.

The app refuses to start without store credentials and OAuth configuration. `/health` is public; `/mcp` always requires authentication. No OAuth provider or Railway service is provisioned by this code.

## Permissions

Read-only by default. Write tools require all of:

- `ENABLE_WRITE_TOOLS=true`;
- an authorized user token with `woocommerce:read` and `woocommerce:write` scopes;
- WooCommerce REST API credentials with write permission.

OAuth client secrets belong in the ChatGPT/provider configuration. WooCommerce secrets belong in Railway Variables. Tools cannot override the configured store or credentials. WordPress post tools additionally require `WORDPRESS_USERNAME` and an Application Password in `WORDPRESS_PASSWORD`.

## Development

Requires Node.js 22 or newer.

```bash
npm ci
npm test
# After filling .env (never commit it):
node --env-file=.env build/http.js
```

Railway starts `npm start` / `node build/http.js` using environment variables. The app listens on `0.0.0.0:$PORT` (default 3000). It uses stateless Streamable HTTP; no session database is required. HTTPS terminates at Railway.

Local MCP clients can continue launching `node build/index.js` with environment variables (`npm run start:stdio`). This is now standard MCP stdio, not the old custom JSON-RPC protocol.

## API compatibility

The catalog covers 119 upstream methods. Only permitted tools are exposed. Tools accept the original business parameters (`productId`, `perPage`, `productData`, etc.), but no `siteUrl` or credential arguments. Unknown fields and unsafe path identifiers are rejected.

The [upstream method reference](docs/UPSTREAM_README.md) is retained for business-parameter examples. Its old direct JSON-RPC examples and installation instructions are **not** the protocol for this fork. MCP clients invoke `tools/call` with `{name, arguments}`.

Tests cover transport/authentication and representative operations against a mock store. Live ChatGPT/OAuth/WooCommerce verification still requires your configured accounts. Upstream WordPress meta endpoints, product review routes and metadata deletion semantics may require fixes for your store; test write operations on staging before enabling them.

MIT — original integration by techspawn. See [LICENSE](LICENSE).

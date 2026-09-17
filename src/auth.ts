import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { JWTVerifyGetKey } from 'jose';
import { InvalidTokenError } from '@modelcontextprotocol/sdk/server/auth/errors.js';
import type { OAuthTokenVerifier } from '@modelcontextprotocol/sdk/server/auth/provider.js';
import type { HttpConfig } from './config.js';

export const READ_SCOPE = 'woocommerce:read';
export const WRITE_SCOPE = 'woocommerce:write';
export const resourceUrl = (config: HttpConfig) => `${config.publicUrl}/mcp`;
export const metadataUrl = (config: HttpConfig) => `${config.publicUrl}/.well-known/oauth-protected-resource/mcp`;

// Authorization and refresh flows belong to the identity provider. This server
// accepts only RS256 access tokens for its exact resource and listed owners.
export function createVerifier(config: HttpConfig, testKeys?: JWTVerifyGetKey): OAuthTokenVerifier {
  const keys = testKeys ?? createRemoteJWKSet(new URL(config.jwksUrl), {
    timeoutDuration: 5000,
    cooldownDuration: 30000,
  });
  return {
    async verifyAccessToken(token) {
      try {
        const { payload } = await jwtVerify(token, keys, {
          algorithms: ['RS256'],
          issuer: config.issuer,
          audience: resourceUrl(config),
          requiredClaims: ['exp', 'iat', 'sub', 'iss', 'aud'],
        });
        if (!payload.sub || !config.allowedSubjects.includes(payload.sub)) {
          throw new Error('User not allowed');
        }
        const scopes = typeof payload.scope === 'string' ? payload.scope.split(/\s+/).filter(Boolean) : [];
        return {
          token,
          clientId: typeof payload.azp === 'string' ? payload.azp : 'oauth-client',
          scopes,
          expiresAt: payload.exp,
          resource: new URL(resourceUrl(config)),
          extra: { subject: payload.sub },
        };
      } catch {
        // Never expose tokens, provider responses, or signing details to clients/logs.
        throw new InvalidTokenError('Invalid or unauthorized access token');
      }
    },
  };
}

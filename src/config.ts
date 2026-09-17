export interface StoreConfig {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
  username?: string;
  password?: string;
  enableWrites: boolean;
}
export interface HttpConfig extends StoreConfig {
  publicUrl: string;
  issuer: string;
  jwksUrl: string;
  allowedSubjects: string[];
  port: number;
}
function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
function httpsUrl(value: string, name: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error(`${name} must be an HTTPS URL without credentials, query or fragment`);
  }
  return url;
}
export function loadStoreConfig(env = process.env): StoreConfig {
  const siteUrl = httpsUrl(required(env, 'WORDPRESS_SITE_URL'), 'WORDPRESS_SITE_URL').href.replace(/\/$/, '');
  if (env.ENABLE_WRITE_TOOLS && !['true', 'false'].includes(env.ENABLE_WRITE_TOOLS)) {
    throw new Error('ENABLE_WRITE_TOOLS must be true or false');
  }
  if (Boolean(env.WORDPRESS_USERNAME) !== Boolean(env.WORDPRESS_PASSWORD)) {
    throw new Error('Set both WORDPRESS_USERNAME and WORDPRESS_PASSWORD, or neither');
  }
  return {
    siteUrl,
    consumerKey: required(env, 'WOOCOMMERCE_CONSUMER_KEY'),
    consumerSecret: required(env, 'WOOCOMMERCE_CONSUMER_SECRET'),
    username: env.WORDPRESS_USERNAME,
    password: env.WORDPRESS_PASSWORD,
    enableWrites: env.ENABLE_WRITE_TOOLS === 'true',
  };
}
export function loadHttpConfig(env = process.env): HttpConfig {
  const publicValue = env.PUBLIC_URL || (env.RAILWAY_PUBLIC_DOMAIN ? `https://${env.RAILWAY_PUBLIC_DOMAIN}` : '');
  if (!publicValue) throw new Error('Set PUBLIC_URL or generate a Railway public domain');
  const publicUrl = httpsUrl(publicValue, 'PUBLIC_URL');
  if (publicUrl.pathname !== '/') throw new Error('PUBLIC_URL must be the origin, without /mcp');
  const issuer = httpsUrl(required(env, 'OAUTH_ISSUER'), 'OAUTH_ISSUER').href;
  const jwksUrl = httpsUrl(required(env, 'OAUTH_JWKS_URL'), 'OAUTH_JWKS_URL').href;
  const allowedSubjects = required(env, 'OAUTH_ALLOWED_SUBJECTS').split(',').map(s => s.trim()).filter(Boolean);
  if (!allowedSubjects.length || allowedSubjects.includes('*')) throw new Error('List exact allowed OAuth user IDs; wildcard access is not supported');
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535');
  return { ...loadStoreConfig(env), publicUrl: publicUrl.origin, issuer, jwksUrl, allowedSubjects, port };
}

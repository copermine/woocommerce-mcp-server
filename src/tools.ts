import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { catalog } from './catalog.js';
import type { StoreConfig } from './config.js';
import { READ_SCOPE, WRITE_SCOPE } from './auth.js';

const segment = z.string().min(1).max(200).regex(/^[A-Za-z0-9_-]+$/, 'Use a single identifier, not a URL or path');
const scalar = z.union([z.string().max(10000), z.number().finite(), z.boolean()]);
const queryValue = z.union([scalar, z.array(scalar).max(100)]);
const fields: Record<string, z.ZodTypeAny> = {
  perPage: z.number().int().min(1).max(100).describe('Page size, 1–100; default 10.'),
  page: z.number().int().positive().describe('One-based page number; default 1.'),
  filters: z.record(queryValue).superRefine((value, ctx) => {
    if (value.per_page !== undefined && (!Number.isInteger(value.per_page) || Number(value.per_page) < 1 || Number(value.per_page) > 100)) {
      ctx.addIssue({ code: 'custom', message: 'filters.per_page must be an integer from 1 to 100' });
    }
    for (const key of ['consumer_key', 'consumer_secret', 'siteUrl', 'username', 'password']) {
      if (key in value) ctx.addIssue({ code: 'custom', message: 'Credentials and destinations cannot be supplied as filters' });
    }
  }).describe('WooCommerce REST API query filters, e.g. search, status, category, after, before. Does not select a store or credentials.'),
  force: z.boolean().describe('Whether to permanently delete. Some upstream endpoints require true; inspect before deleting.'),
  zoneId: z.number().int().nonnegative().describe('Shipping zone ID; 0 is the default zone.'),
  gatewayId: segment,
  toolId: segment,
  group: segment,
  id: segment.describe('Setting option identifier.'),
  slug: segment,
  metaKey: z.string().min(1).max(200).regex(/^[A-Za-z0-9_.-]+$/).refine(value => value !== '.' && value !== '..', 'Use a metadata key, not a path segment'),
  metaValue: z.unknown().refine(v => v !== undefined, 'metaValue is required').describe('Metadata value, including JSON objects or null.'),
  title: z.string().min(1).max(1000),
  content: z.string().min(1).max(200000),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private']),
  period: z.enum(['week', 'month', 'last_month', 'year']),
  dateMin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateMax: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locations: z.array(z.object({ code: z.string().min(1), type: z.enum(['postcode', 'state', 'country', 'continent']) }).strict()).max(500),
};
const wordpress = new Set(['create_post', 'get_posts', 'update_post', 'get_post_meta', 'update_post_meta', 'create_post_meta', 'delete_post_meta']);
function field(name: string) {
  if (fields[name]) return fields[name];
  if (name.endsWith('Id')) return z.number().int().positive().describe(`${name}: positive numeric record ID.`);
  if (name.endsWith('Data')) return z.record(z.unknown()).describe(`REST API body for ${name}; use WooCommerce field names, e.g. regular_price as a string.`);
  throw new Error(`No schema for ${name}`);
}
export function availableTools(config: StoreConfig) {
  return catalog.filter(entry => (config.enableWrites || entry.name.startsWith('get_')) &&
    (!wordpress.has(entry.name) || (config.username && config.password))).map(entry => {
    const readOnly = entry.name.startsWith('get_');
    const shape: z.ZodRawShape = {};
    for (const key of entry.fields) shape[key] = entry.required.includes(key) ? field(key) : field(key).optional();
    const schema = z.object(shape).strict();
    const inputSchema = zodToJsonSchema(schema, { target: 'jsonSchema7', $refStrategy: 'none' });
    const securitySchemes = [{ type: 'oauth2', scopes: readOnly ? [READ_SCOPE] : [READ_SCOPE, WRITE_SCOPE] }];
    const description = `${entry.name.replaceAll('_', ' ')} in the configured ${wordpress.has(entry.name) ? 'WordPress site' : 'WooCommerce store'}. ` +
      (readOnly ? 'Use this to inspect records; paginate list results.' : 'Use only when the user requests this change. This operation changes store data.') +
      (entry.name.includes('post_meta') ? ' Requires WordPress support for the upstream /posts/{id}/meta endpoint.' : '');
    return {
      schema,
      readOnly,
      definition: {
        name: entry.name,
        description,
        inputSchema: inputSchema as { type: 'object'; properties: Record<string, unknown> },
        annotations: { readOnlyHint: readOnly, destructiveHint: !readOnly, idempotentHint: readOnly, openWorldHint: true },
        securitySchemes,
        _meta: { securitySchemes },
      },
    };
  });
}

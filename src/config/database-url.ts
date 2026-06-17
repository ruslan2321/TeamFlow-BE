const POOLED_URL_KEYS = [
  'POSTGRES_URL',
  'DATABASE_URL',
  'POSTGRES_PRISMA_URL',
] as const;

const UNPOOLED_URL_KEYS = [
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
] as const;

const ALL_DATABASE_URL_KEYS = [
  ...POOLED_URL_KEYS,
  ...UNPOOLED_URL_KEYS,
] as const;

function pickRawDatabaseUrl(): string | undefined {
  const keys = process.env.VERCEL ? POOLED_URL_KEYS : ALL_DATABASE_URL_KEYS;

  const pooled = keys.map((key) => process.env[key]).find(Boolean);
  if (pooled) {
    return pooled;
  }

  if (process.env.VERCEL) {
    return UNPOOLED_URL_KEYS.map((key) => process.env[key]).find(Boolean);
  }

  return undefined;
}

/** URL для TypeORM: pooled на Vercel/Neon, без channel_binding (несовместим с node-pg). */
export function getDatabaseUrl(): string {
  const raw = pickRawDatabaseUrl();

  if (!raw) {
    throw new Error(
      `Database URL is not set. Add one of: ${ALL_DATABASE_URL_KEYS.join(', ')}`,
    );
  }

  return sanitizeNeonUrl(raw);
}

function sanitizeNeonUrl(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.delete('channel_binding');

  if (!parsed.searchParams.has('sslmode')) {
    parsed.searchParams.set('sslmode', 'require');
  }

  if (process.env.VERCEL) {
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '10');
    }
    if (
      parsed.hostname.includes('.neon.tech') &&
      !parsed.hostname.includes('-pooler')
    ) {
      console.warn(
        '[database] On Vercel use Neon POOLED URL (*-pooler.*.neon.tech / POSTGRES_URL)',
      );
    }
  }

  return parsed.toString();
}

export function shouldSynchronizeSchema(): boolean {
  if (process.env.DB_SYNCHRONIZE === 'true') return true;
  if (process.env.DB_SYNCHRONIZE === 'false') return false;
  return !process.env.VERCEL && process.env.NODE_ENV !== 'production';
}

export function getTypeOrmExtraOptions(): Record<string, unknown> {
  if (process.env.VERCEL) {
    return {
      max: 1,
      connectionTimeoutMillis: 8_000,
      idleTimeoutMillis: 5_000,
      statement_timeout: 15_000,
    };
  }

  return {
    max: 10,
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 30_000,
  };
}

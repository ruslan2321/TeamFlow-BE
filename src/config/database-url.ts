const DATABASE_URL_KEYS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
] as const;

/** URL для TypeORM: pooled на Vercel/Neon, без channel_binding (несовместим с node-pg). */
export function getDatabaseUrl(): string {
  const raw = DATABASE_URL_KEYS.map((key) => process.env[key]).find(Boolean);

  if (!raw) {
    throw new Error(
      `Database URL is not set. Add one of: ${DATABASE_URL_KEYS.join(', ')}`,
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
  return parsed.toString();
}

export function shouldSynchronizeSchema(): boolean {
  if (process.env.DB_SYNCHRONIZE === 'true') return true;
  if (process.env.DB_SYNCHRONIZE === 'false') return false;
  return !process.env.VERCEL && process.env.NODE_ENV !== 'production';
}

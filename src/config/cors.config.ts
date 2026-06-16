const DEFAULT_ORIGINS = [
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://team-flow-fe-virid.vercel.app',
  'https://team-flow-iwlet6sl3-alanks-projects-619353e8.vercel.app',
];

/** Preview-деплои Vercel вида https://team-flow-xxx.vercel.app */
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/team-flow[a-z0-9-]*\.vercel\.app$/i;

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  const fromEnv = process.env.FRONTEND_URL ?? process.env.CORS_ORIGINS;
  const allowed = fromEnv
    ? fromEnv.split(',').map((item) => item.trim()).filter(Boolean)
    : DEFAULT_ORIGINS;

  if (allowed.includes(origin)) {
    return true;
  }

  return VERCEL_PREVIEW_ORIGIN.test(origin);
}

export function getCorsConfig() {
  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  };
}

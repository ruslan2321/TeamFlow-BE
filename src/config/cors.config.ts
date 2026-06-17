const DEFAULT_ORIGINS = [
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://team-flow-fe-virid.vercel.app',
  'https://team-flow-iwlet6sl3-alanks-projects-619353e8.vercel.app',
];

/** Локальная разработка: localhost и 127.0.0.1 на любом порту */
const LOCAL_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

/** Любой preview/production на vercel.app (фронт меняет URL при каждом деплое) */
const VERCEL_APP_ORIGIN = /^https:\/\/[\w-]+\.vercel\.app$/i;

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  if (LOCAL_DEV_ORIGIN.test(origin)) {
    return true;
  }

  const fromEnv = process.env.FRONTEND_URL ?? process.env.CORS_ORIGINS;
  if (fromEnv) {
    const allowed = fromEnv
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (allowed.includes(origin)) {
      return true;
    }
  }

  if (DEFAULT_ORIGINS.includes(origin)) {
    return true;
  }

  return VERCEL_APP_ORIGIN.test(origin);
}

export function getCorsConfig() {
  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // callback(Error) даёт 500 на OPTIONS — только true/false
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    optionsSuccessStatus: 204,
  };
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../dist/bootstrap-app';

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  appPromise ??= createApp();
  const app = await appPromise;
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
}

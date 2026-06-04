import express from 'express';
import { createApp } from '../src/bootstrap';

const expressApp = express();
let ready = false;

export default async function handler(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  if (!ready) {
    await createApp(expressApp);
    ready = true;
  }
  expressApp(req, res);
}

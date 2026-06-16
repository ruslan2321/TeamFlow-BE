import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ensureUploadDirs, UPLOADS_DIR } from './config/avatar-upload.config';
import { getCorsConfig } from './config/cors.config';

export async function configureApp(
  app: NestExpressApplication,
): Promise<NestExpressApplication> {
  ensureUploadDirs();

  app.enableCors(getCorsConfig());
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  return app;
}

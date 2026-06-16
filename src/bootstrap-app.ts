import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ensureUploadDirs, UPLOADS_DIR } from './config/avatar-upload.config';
import { getCorsConfig } from './config/cors.config';

export async function createApp(): Promise<NestExpressApplication> {
  ensureUploadDirs();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors(getCorsConfig());

  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

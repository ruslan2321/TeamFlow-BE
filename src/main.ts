import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await configureApp(app);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error('Failed to start NestJS application:', error);
  process.exit(1);
});

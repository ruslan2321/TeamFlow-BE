// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './profile/user.module';
import { CardModule } from './card/card.module';
import { MailerModule } from './mailer/mailer.module';
import { ResetPasswordModule } from './reset-password/reset-password.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';
        const databaseUrl = config.get<string>('DATABASE_URL');

        // Парсим DATABASE_URL для проверки хоста
        let isLocal = false;
        if (databaseUrl) {
          try {
            const url = new URL(databaseUrl);
            const host = url.hostname;
            // Локальные хосты: localhost, 127.0.0.1, host.docker.internal
            isLocal =
              host === 'localhost' ||
              host === '127.0.0.1' ||
              host === 'host.docker.internal';
          } catch {
            // Если не удалось распарсить — считаем, что не локальный
          }
        }

        return {
          type: 'postgres',
          url: databaseUrl,
          // SSL только для продакшена и не-локальных хостов
          ssl:
            isProduction && !isLocal
              ? { rejectUnauthorized: false } // Для облачных БД с self-signed сертификатами
              : false,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),

    JwtModule,
    UsersModule,
    CardModule,
    MailerModule,
    ResetPasswordModule,
  ],
  exports: [JwtModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

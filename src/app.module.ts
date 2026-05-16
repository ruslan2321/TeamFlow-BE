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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');

        if (!databaseUrl) {
          throw new Error('DATABASE_URL is missing');
        }

        return {
          type: 'postgres',
          url: databaseUrl,
          ssl: { rejectUnauthorized: false },
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),

    JwtModule.register({}),
    UsersModule,
    CardModule,
    MailerModule,
    ResetPasswordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [JwtModule],
})
export class AppModule {}
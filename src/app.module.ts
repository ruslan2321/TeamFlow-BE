import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './profile/user.entities';
import { UsersModule } from './profile/user.module';
import { JwtModule } from '@nestjs/jwt';
import { Card } from './card/card.entites';
import { CardModule } from './card/card.module';
import { MailerModule } from './mailer/mailer.module';
import { ResetPasswordModule } from './reset-password/reset-password.module';
import { getDatabaseUrl, shouldSynchronizeSchema } from './config/database-url';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres' as const,
        url: getDatabaseUrl(),
        autoLoadEntities: true,
        synchronize: shouldSynchronizeSchema(),
        ssl: { rejectUnauthorized: false },
        extra: {
          max: process.env.VERCEL ? 1 : 10,
          connectionTimeoutMillis: 15_000,
        },
        retryAttempts: 2,
        retryDelay: 2000,
      }),
    }),
    TypeOrmModule.forFeature([User, Card]),
    UsersModule,
    CardModule,
    JwtModule,
    MailerModule,
    ResetPasswordModule,
  ],
  exports: [JwtModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

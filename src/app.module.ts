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
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: true,
        autoLoadEntities: true,
        synchronize: false,
      }),
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

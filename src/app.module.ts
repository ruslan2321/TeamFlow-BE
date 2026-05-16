import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: 'postgres',
      port: 5432,
      host: 'localhost',
      password: 'ruslan',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
      entities: ['users', 'cards'],
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

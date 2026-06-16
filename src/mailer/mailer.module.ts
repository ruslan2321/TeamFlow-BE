import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';           
import { User } from '../profile/user.entities'; 
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';


@Module({
  controllers: [MailerController],
  providers: [MailerService],
  exports: [NestMailerModule],
  imports:[
    NestMailerModule.forRoot({
      transport:{
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth:{
          user: 'teamflow398@gmail.com',
          pass: 'koof vlpi trmk ufox',
        }
      },  
      defaults:{
        from:'"TeamFlow"<teamflow398@gmail.com>'
      }
    }),
    TypeOrmModule.forFeature([User]), 
        
  ]
})
export class MailerModule {}

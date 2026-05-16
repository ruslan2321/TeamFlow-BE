import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('sendemail')
  async sendEmail(@Body() body: { email: string }) {
    const { email } = body;
    if (!email) {
      return { error: 'Укажи email=test@example.com' };
    }
    try {
      await this.mailerService.SendMail(email);
    } catch (error) {}
  }

  @Post('sendcode')
  async sendCode(@Body() body: { email: string }) {
    const { email } = body;
    if (!email) {
      return { error: 'Укажите свою почту' };
    }
    try {
      await this.mailerService.SendCodeV(email);
    } catch {}
  }
  
  @Post('verifycode')
  async verycode(@Body() body: { email: string; code: string }) {
    const isValid = await this.mailerService.VerifycationCode(
      body.code,
      body.email,
    );
    return isValid
      ? { success: true, message: 'Email подтверждён!' }
      : { success: false, error: 'Неверный код' };
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendEmailDto } from './dto/send-email-dto';
import { VerifCode } from './dto/send-code-dto';

@Controller('')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('sendemail')
  async sendEmail(@Body() dto: SendEmailDto) {
    try {
      await this.mailerService.SendMail(dto.email);
    } catch (error) {}
  }

  @Post('sendcode')
  async sendCode(@Body() dto: SendEmailDto) {
    await this.mailerService.SendCodeV(dto.email);
    return {
      message:
        'Если email зарегистрирован, на него отправлен код для сброса пароля',
    };
  }

  @Post('verifycode')
  async verycode(@Body() dto: VerifCode) {
    const isValid = await this.mailerService.VerifycationCode(
      dto.code,
      dto.email,
    );
    return isValid
      ? { success: true, message: 'Email подтверждён!' }
      : { success: false, error: 'Неверный код' };
  }
}

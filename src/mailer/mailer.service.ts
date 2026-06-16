import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../profile/user.entities';
import { Repository } from 'typeorm';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailer: NestMailerService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async SendMail(email: string) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Добро пожаловать!',
      text: '',
      html: ` <div
      style="
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        padding: 40px 30px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      "
    >
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0099ff; font-size: 28px; margin: 0; font-weight: 600;">Добро пожаловать в TeamFlow!</h1>
        <div style="width: 60px; height: 4px; background-color: #0099ff; margin: 15px auto; border-radius: 2px;"></div>
      </div>
      <p
        style="
          text-align: center;
          font-size: 18px;
          color: #555;
          line-height: 1.6;
          margin: 20px 0;
        "
      >
        Спасибо за регистрацию! Теперь вы можете легко управлять проектами, сотрудничать с командой и достигать целей быстрее.
      </p>
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #888; font-size: 14px; margin: 0;">
          © 2026 TeamFlow
        </p>
      </div>
    </div>`,
    });
  }
  async SendCodeV(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.userRepository.update(
      { id: user.id },
      {
        passwordResetCode: code,
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    );
    await this.mailer.sendMail({
      to: normalizedEmail,
      subject: 'Сброс пароля — TeamFlow',
      text: `Ваш код для сброса пароля: ${code}. Код действует 15 минут.`,
      html: `<div
      style="
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      "
    >
      <h1 style="color: #0099ff; text-align: center">Сброс пароля</h1>
      <div
        style="
          background: #0099ff;
          color: white;
          font-size: 32px;
          font-weight: bold;
          text-align: center;
          padding: 25px;
          border-radius: 12px;
          margin: 30px 0;
          letter-spacing: 6px;
        "
      >
        ${code}
      </div>
      <p
        style="
          text-align: center;
          font-size: 16px;
          color: #333;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        Используйте этот код для установки нового пароля. Код действует 15 минут.
      </p>
      <div
        style="
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          font-size: 14px;
          color: #666;
        "
      >
        <strong>Не запрашивали сброс?</strong><br />
        Игнорируйте письмо — пароль не изменится.
      </div>
      <p style="text-align: center; color: #666; font-size: 14px">
        © 2026 TeamFlow
      </p>
    </div>`,
    });
  }
  async VerifycationCode(code:string, email:string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await this.userRepository.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    
    throw new BadRequestException('Пользователь не найден');
  }

  if (user.verificationCode !== code) {
    throw new BadRequestException('Неверный код подтверждения');
  }

  if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
    throw new BadRequestException('Код просрочен. Запросите новый');
  }
    await this.userRepository.update({ id: user.id }, {
      verificationCode: null,
      verificationCodeExpires: null,
      emailVerified: true,
    });
    return true;
  }
}

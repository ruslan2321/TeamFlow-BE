import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from 'src/profile/user.entities';

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailer: NestMailerService,
  ) {}

  async requestReset(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return {
        message:
          'Если email зарегистрирован, на него отправлен код для сброса пароля',
      };
    }

    const code = this.generateCode();

    await this.userRepo.update(
      { id: user.id },
      {
        passwordResetCode: code,
        passwordResetExpires: new Date(Date.now() + RESET_CODE_TTL_MS),
      },
    );

    await this.sendResetEmail(normalizedEmail, code);

    return {
      message:
        'Если email зарегистрирован, на него отправлен код для сброса пароля',
    };
  }

  async verifyCode(email: string, code: string): Promise<{ valid: boolean }> {
    await this.findUserWithValidCode(email, code);
    return { valid: true };
  }

  async confirmReset(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.findUserWithValidCode(email, code);

    const hashPass = await bcrypt.hash(newPassword, 10);

    await this.userRepo.update(
      { id: user.id },
      {
        password: hashPass,
        passwordResetCode: null,
        passwordResetExpires: null,
      },
    );

    return { message: 'Пароль успешно изменён' };
  }

  private async findUserWithValidCode(
    email: string,
    code: string,
  ): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.passwordResetCode || user.passwordResetCode !== code) {
      throw new BadRequestException('Неверный код подтверждения');
    }

    if (
      user.passwordResetExpires &&
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException('Код просрочен. Запросите новый');
    }

    return user;
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendResetEmail(email: string, code: string): Promise<void> {
    await this.mailer.sendMail({
      to: email,
      subject: 'Сброс пароля — TeamFlow',
      text: `Ваш код для сброса пароля: ${code}. Код действует 15 минут.`,
      html: `<div style="max-width:600px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,sans-serif">
        <h1 style="color:#0099ff;text-align:center">Сброс пароля</h1>
        <div style="background:#0099ff;color:white;font-size:32px;font-weight:bold;text-align:center;padding:25px;border-radius:12px;margin:30px 0;letter-spacing:6px">${code}</div>
        <p style="text-align:center;font-size:16px;color:#333">Используйте этот код для установки нового пароля. Код действует 15 минут.</p>
        <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:30px 0;font-size:14px;color:#666">
          <strong>Не запрашивали сброс?</strong><br />Игнорируйте письмо — пароль не изменится.
        </div>
        <p style="text-align:center;color:#666;font-size:14px">© 2026 TeamFlow</p>
      </div>`,
    });
  }
}

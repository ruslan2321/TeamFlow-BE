import { Body, Controller, Post } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset.dto';
import { ConfirmResetDto } from './dto/confirm-reset.dto';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  /** Шаг 1: запросить код на email */
  @Post('request')
  async requestReset(@Body() dto: RequestResetDto) {
    return this.resetPasswordService.requestReset(dto.email);
  }

  /** Шаг 2 (опционально): проверить код без смены пароля */
  @Post('verify')
  async verifyCode(@Body() dto: VerifyResetCodeDto) {
    return this.resetPasswordService.verifyCode(dto.email, dto.code);
  }

  /** Шаг 3: установить новый пароль */
  @Post('confirm')
  async confirmReset(@Body() dto: ConfirmResetDto) {
    return this.resetPasswordService.confirmReset(
      dto.email,
      dto.code,
      dto.password,
    );
  }
}

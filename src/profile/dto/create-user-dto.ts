import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUser {
  @IsOptional()
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'Логин должен быть строкой' })
  login?: string;

  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password!: string;

  /** Фронт может слать для подтверждения — не сохраняем */
  @IsOptional()
  @IsString()
  confirmPassword?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  post?: string;
}

export function resolveCreateUserIdentity(dto: CreateUser): {
  username: string;
  login: string;
} {
  const login = (
    dto.login?.trim() ||
    dto.username?.trim() ||
    dto.name?.trim() ||
    `${dto.firstname?.trim() ?? ''} ${dto.lastname?.trim() ?? ''}`.trim()
  );

  const username = (
    dto.username?.trim() ||
    dto.name?.trim() ||
    `${dto.firstname?.trim() ?? ''} ${dto.lastname?.trim() ?? ''}`.trim() ||
    login
  );

  return { username, login };
}

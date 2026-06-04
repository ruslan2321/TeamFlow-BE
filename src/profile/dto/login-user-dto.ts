import { IsNotEmpty, IsString } from 'class-validator';

export class login {
  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин обязателен' })
  login!: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password!: string;
}

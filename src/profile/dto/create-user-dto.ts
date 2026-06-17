import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUser {
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  name!: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  firstname!: string;

  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия обязательна' })
  lastname!: string;

  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин обязателен' })
  login!: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password!: string;

  @IsString({ message: 'Роль должна быть строкой' })
  @IsNotEmpty({ message: 'Роль обязательна' })
  role!: string;

  @IsString({ message: 'Должность должна быть строкой' })
  @IsNotEmpty({ message: 'Должность обязательна' })
  post!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;
}

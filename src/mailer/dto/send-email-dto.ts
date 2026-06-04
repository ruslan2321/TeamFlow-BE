import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsEmail({}, { message: 'Укажите корректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email!: string;
}

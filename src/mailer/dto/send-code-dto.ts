import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifCode {
  @IsEmail({}, { message: 'Укажите корректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Код обязателен' })
  @Length(6, 6, { message: 'Код должен содержать 6 цифр' })
  code!: string;
}

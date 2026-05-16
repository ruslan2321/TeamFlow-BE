import { PartialType } from '@nestjs/mapped-types';
import { CreateUser } from './create-user-dto'; // Или ваш основной DTO создания

// Если у вас нет общего базового DTO, можно описать вручную:
import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  aboutMe?: string;

  @IsOptional()
  @IsString()
  role?: string;
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  department?: string;

  // Био обычно тоже хранится в профиле, если есть такое поле в Entity
  @IsOptional()
  @IsString()
  bio?: string;
}

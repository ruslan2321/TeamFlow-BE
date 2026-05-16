import { IsOptional, IsString, MaxLength, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string; 

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @MaxLength(100)
  limit?: number = 20; 
}
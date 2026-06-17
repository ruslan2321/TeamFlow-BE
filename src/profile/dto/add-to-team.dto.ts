import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class AddToTeamDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'memberId должен быть целым числом' })
  memberId?: number;

  /** Альтернативное имя с фронта */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'userId должен быть целым числом' })
  userId?: number;

  /** Альтернативное имя с фронта */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'id должен быть целым числом' })
  id?: number;
}

export function resolveMemberId(dto: AddToTeamDto): number {
  const memberId = dto.memberId ?? dto.userId ?? dto.id;

  if (memberId === undefined || memberId === null) {
    throw new BadRequestException('memberId обязателен');
  }

  return memberId;
}

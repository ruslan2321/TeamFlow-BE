import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddToTeamDto {
  @Type(() => Number)
  @IsInt({ message: 'memberId должен быть целым числом' })
  @IsNotEmpty({ message: 'memberId обязателен' })
  memberId!: number;
}


import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTask {
  @IsString({ message: 'Названи должно быть строкой' })
  @IsNotEmpty({ message: 'Название Обязательно' })
  title!: string;
  @IsString({ message: 'Название задачи' })
  name_task!: string;
  @IsString({ message: 'Описание должно быть строкой' })
  @IsNotEmpty({ message: 'Описание Обязательно' })
  description!: string;
  @IsString({ message: 'Названи должно быть строкой' })
  @IsNotEmpty({ message: 'Название Обязательно' })
  status!: string;
}

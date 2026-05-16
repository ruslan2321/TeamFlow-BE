import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CardService } from './card.service';
import { Card } from './card.entites';
import { CreateTask } from './dto/create-task';
import { PATH_METADATA } from '@nestjs/common/constants';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';
import { EditTask } from './dto/update-task';
import { CurrentUser } from 'src/decorator/current-user.decorator';

@Controller('task')
export class CardController {
  constructor(private service: CardService) {}

  @Get('task')
  async getTasks(): Promise<Card[]> {
    return this.service.Task();
  }
  @Get('my/:userId')
  async getMyTasks(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Card[]> {
    return this.service.getMyTasks(userId);
  }
  @Post('add_task/:userId')
  async addTask(
    @Body() dto: CreateTask,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.service.addTask(dto, userId);
  }
  @Get(':task_id')
  async getView(
    @Param('task_id', ParseIntPipe) task_id: number,
  ): Promise<Card> {
    return this.service.viewTask(task_id);
  }
  @Delete('delet/:task_id')
  async deleteTask(
    @Param('task_id', ParseIntPipe) task_id: number,
  ): Promise<void> {
    return this.service.deletTask(task_id);
  }

  @Patch('editTask/:task_id')
  async editTask(@Param('task_id') task_id: number, @Body() dto: EditTask) {
    return this.service.editTask(task_id, dto);
  }
}

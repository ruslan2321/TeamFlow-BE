import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './card.entites';
import { Repository } from 'typeorm';
import { CreateTask } from './dto/create-task';
import { EditTask } from './dto/update-task';
import { User } from 'src/profile/user.entities';
import {
  TaskResponseDto,
  toTaskList,
  toTaskResponse,
} from 'src/common/mappers/card.mapper';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private repo: Repository<Card>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async Task(): Promise<TaskResponseDto[]> {
    const tasks = await this.repo.find({
      relations: ['assignedUser'],
    });
    return toTaskList(tasks);
  }

  async getMyTasks(userId: number): Promise<TaskResponseDto[]> {
    const tasks = await this.repo.find({
      where: { assignedUser: { id: userId } },
      relations: ['assignedUser'],
      order: { createAt: 'DESC' },
    });
    return toTaskList(tasks);
  }

  async addTask(dto: CreateTask, userId: number): Promise<TaskResponseDto> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Исполнитель не найден');

    const newTask = this.repo.create({
      title: dto.title,
      name_task: dto.name_task,
      description: dto.description,
      status: dto.status,
      assignedUser: user,
    });

    const saved = await this.repo.save(newTask);

    if (saved.task_id) {
      const task = await this.repo.findOne({
        where: { task_id: saved.task_id },
        relations: ['assignedUser'],
      });
      if (task) return toTaskResponse(task);
    }

    return toTaskResponse(saved);
  }

  async deletTask(task_id: number): Promise<void> {
    await this.repo.delete(task_id);
  }

  async viewTask(task_id: number): Promise<TaskResponseDto> {
    const task = await this.repo.findOne({
      where: { task_id },
      relations: { assignedUser: true },
    });
    if (!task) {
      throw new NotFoundException(`Задача с ID ${task_id} не найдена`);
    }
    return toTaskResponse(task);
  }

  async editTask(task_id: number, dto: EditTask): Promise<TaskResponseDto> {
    const item = await this.repo.findOne({
      where: { task_id },
      relations: ['assignedUser'],
    });

    if (!item) {
      throw new NotFoundException(`Задача с ID ${task_id} не найдена`);
    }

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    ) as Partial<Card>;

    if (cleanDto.CommentTask?.trim()) {
      const ts = new Date().toLocaleString('ru-RU');
      const newEntry = `[${ts}] ${cleanDto.CommentTask.trim()}`;
      item.CommentTask = item.CommentTask?.trim()
        ? `${item.CommentTask}\n${newEntry}`
        : newEntry;
      await this.repo.save(item);
      delete cleanDto.CommentTask;
    }

    if ('userId' in cleanDto) {
      if (cleanDto.userId === null) {
        await this.repo.update({ task_id }, { assignedUser: null });
      } else if (typeof cleanDto.userId === 'number') {
        await this.repo.update(
          { task_id },
          { assignedUser: { id: cleanDto.userId } },
        );
      }
      delete cleanDto.userId;
    }
    if (Object.keys(cleanDto).length > 0) {
      this.repo.merge(item, cleanDto);
      await this.repo.save(item);
    }

    const updated = await this.repo.findOneOrFail({
      where: { task_id },
      relations: ['assignedUser'],
    });

    return toTaskResponse(updated);
  }
}

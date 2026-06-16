import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './card.entites';
import { Repository } from 'typeorm';
import { CreateTask } from './dto/create-task';
import { EditTask } from './dto/update-task';
import { User } from 'src/profile/user.entities';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private repo: Repository<Card>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async Task(): Promise<Card[]> {
    return this.repo.find({
      relations: ['assignedUser'],
    });
  }
  async getMyTasks(userId: number): Promise<Card[]> {
    return this.repo.find({
      where: { userId },
      relations: ['assignedUser'],
      order: { createAt: 'DESC' },
    });
  }
  async addTask(dto: CreateTask, userId: number): Promise<Card> {
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
      if (task) return task;
    }

    return saved;
  }
  async deletTask(task_id:number): Promise<void>{
    const res = await this.repo.delete(task_id)
  }

  async viewTask(task_id: number): Promise<Card> {
    const tasks = await this.repo.findOne({
      where: { task_id },
      relations: { assignedUser: true },
    });
    if (!tasks) {
      throw new NotFoundException(`Задача с ID ${task_id} не найдена`);
    }
    return tasks;
  }
  async editTask(task_id: number, dto: EditTask): Promise<Card> {
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

    return this.repo.findOneOrFail({
      where: { task_id },
      relations: ['assignedUser'],
    });
  }
}

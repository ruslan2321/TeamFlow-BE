import { Card } from 'src/card/card.entites';
import { toPublicUser, PublicUserDto } from './user.mapper';

export interface TaskResponseDto {
  task_id: number;
  title: string;
  description: string;
  status: string;
  name_task: string;
  createAt: string | null;
  CommentTask: string;
  userId: number | null;
  assignedUser: PublicUserDto | null;
}

export function toTaskResponse(task: Card): TaskResponseDto {
  return {
    task_id: task.task_id,
    title: task.title,
    description: task.description,
    status: task.status,
    name_task: task.name_task,
    createAt: task.createAt,
    CommentTask: task.CommentTask ?? '',
    userId: task.userId ?? null,
    assignedUser: task.assignedUser ? toPublicUser(task.assignedUser) : null,
  };
}

export function toTaskList(tasks: Card[]): TaskResponseDto[] {
  return tasks.map(toTaskResponse);
}

import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { User } from 'src/profile/user.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  task_id!: number;
  @Column({ length: 255 })
  title!: string;
  @Column({ length: 255 })
  description!: string;
  @Column({ length: 255, default: 'К разработке' })
  status!: string;
  @Column({ length: 255 })
  name_task!: string;
  @CreateDateColumn({ type: 'timestamp' })
  createAt!: Date;
  @Column({ type: 'text', nullable: true, default: '' })
  CommentTask!: string;
  @ManyToOne(() => User, (user) => user.task_id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Column({ name: 'user_id', nullable: true })
  userId!: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  assignedUser!: User | null;
}

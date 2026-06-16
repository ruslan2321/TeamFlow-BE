import { User } from 'src/profile/user.entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
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

  @Column({ type: 'varchar', nullable: true })
  createAt!: string | null;

  @Column({ type: 'text', nullable: true, default: '' })
  CommentTask!: string;

  @ManyToOne(() => User, (user) => user.task_id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  assignedUser!: User | null;

  @RelationId((card: Card) => card.assignedUser)
  userId!: number | null;
}
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Card } from 'src/card/card.entites';
import { UserStatus } from './dto/user-status';

@Entity('users')
@Index(['username', 'email'])
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id!: number;

  @Column({ length: 255 })
  @Index()
  @Expose()
  username!: string;
  @Expose()
  @Column({
    type: 'varchar',
    length: 20,
    enum: UserStatus,
    default: UserStatus.OFFLINE,
  })
  status!: UserStatus;
  @Column({ length: 255 })
  @Expose()
  email!: string;

  @Column({ length: 255 })
  @Exclude()
  login!: string;

  @Column({ length: 255 })
  @Exclude()
  password!: string;

  @Column({ length: 255, nullable: true })
  @Exclude()
  phone!: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true, type: 'varchar' })
  @Exclude()
  verificationCode!: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  @Exclude()
  verificationCodeExpires!: Date | null;

  @Column({ nullable: true, length: 6, type: 'varchar' })
  @Exclude()
  passwordResetCode!: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  @Exclude()
  passwordResetExpires!: Date | null;

  @Column({ default: false })
  @Exclude()
  emailVerified!: boolean;

  @Column({ length: 255, nullable: true })
  @Expose()
  location?: string;

  @Column({ length: 255, nullable: true })
  @Expose()
  department?: string;

  @Column({ length: 255, nullable: true })
  @Expose()
  aboutme?: string;
  @Column({ length: 255, nullable: true })
  @Expose()
  role?: string;

  // === Связи ===
  @OneToMany(() => Card, (card) => card.assignedUser)
  @Exclude()
  task_id!: Card[];

  // Если нужно показать только имена участников команды:
  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'team_members',
    joinColumn: { name: 'owner_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'member_id', referencedColumnName: 'id' },
  })
  @Exclude()
  teamMembers!: User[];

  @Expose()
  get teamMemberNames(): string[] {
    return this.teamMembers?.map((m) => m.username) ?? [];
  }

  @ManyToMany(() => User, (user) => user.teamMembers)
  @Exclude()
  addedBy!: User[];
}

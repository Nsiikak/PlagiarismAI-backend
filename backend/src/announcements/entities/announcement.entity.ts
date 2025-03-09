import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity()
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.announcements, { onDelete: 'CASCADE' })
  teacher: User;

  @ManyToOne(() => Class, (classEntity) => classEntity.announcements, {
    onDelete: 'CASCADE',
  })
  class: Class;

  @CreateDateColumn()
  createdAt: Date;
}

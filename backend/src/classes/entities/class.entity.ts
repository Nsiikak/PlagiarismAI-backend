import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.createdClasses, { onDelete: 'CASCADE' })
  teacher: User;

  @ManyToMany(() => User, (user) => user.enrolledClasses)
  @JoinTable()
  students: User[];
}

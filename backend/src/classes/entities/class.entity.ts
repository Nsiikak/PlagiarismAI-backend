import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Announcement } from '../../announcements/entities/announcement.entity';

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

  @ManyToMany(() => User, (user) => user.classes)
  users: User[];

  @OneToMany(() => Assignment, (assignment) => assignment.class)
  assignments: Assignment[];

  @OneToMany(() => Announcement, (announcement) => announcement.class)
  announcements: Announcement[];
}

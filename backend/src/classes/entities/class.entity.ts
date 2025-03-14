import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity()
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ unique: true })
  classCode: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.createdClasses, { onDelete: 'CASCADE' })
  teacher: User;

  @ManyToMany(() => User, (user) => user.enrolledClasses)
  @JoinTable()
  students: User[];

  @ManyToMany(() => User, (user) => user.classes)
  users: User[];

  @OneToMany(() => Assignment, (assignment) => assignment.class)
  assignments: Assignment[];

  @BeforeInsert()
  generateClassCode() {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.classCode = code;
  }
}

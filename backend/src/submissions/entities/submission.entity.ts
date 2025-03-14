import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  grade?: number;

  @Column({ nullable: true })
  plagiarismScore?: number;

  @CreateDateColumn()
  submittedAt: Date;

  @ManyToOne(() => User, (user) => user.submissions, { onDelete: 'CASCADE' })
  student: User;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions, {
    onDelete: 'CASCADE',
  })
  assignment: Assignment;
}

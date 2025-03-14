import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';
import { Submission } from '../../submissions/entities/submission.entity';

export enum AssignmentType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  CODE = 'CODE',
  GENERAL = 'GENERAL',
}

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, (user) => user.createdAssignments, {
    onDelete: 'CASCADE',
  })
  teacher: User;

  @ManyToOne(() => Class, (classEntity) => classEntity.assignments, {
    onDelete: 'CASCADE',
  })
  class: Class;

  @OneToMany(() => Submission, (submission) => submission.assignment)
  submissions: Submission[];

  @Column({
    type: 'enum',
    enum: AssignmentType,
    default: AssignmentType.GENERAL,
  })
  type: AssignmentType;

  @Column('json', { nullable: true })
  testCases?: Record<string, string>;

  @Column('text', { nullable: true })
  markingGuide?: string;
}

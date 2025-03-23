import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Submission } from '../../submissions/entities/submission.entity';
import { UserRole } from '../../auth/dto/register.dto';
import { Notification } from '../../notifications/entities/notification.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  matricOrStaffId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @OneToMany(() => Class, (classEntity) => classEntity.teacher)
  createdClasses: Class[];

  @ManyToMany(() => Class, (classEntity) => classEntity.students)
  enrolledClasses: Class[];

  @OneToMany(() => Assignment, (assignment) => assignment.teacher)
  createdAssignments: Assignment[];

  @OneToMany(() => Submission, (submission) => submission.student)
  submissions: Submission[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}

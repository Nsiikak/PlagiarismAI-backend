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
import { Announcement } from '../../announcements/entities/announcement.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  identifier: string; // Matric Number (Student) or Staff ID (Teacher)

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  classes: Class[];

  @OneToMany(() => Class, (classEntity) => classEntity.teacher)
  createdClasses: Class[];

  @ManyToMany(() => Class, (classEntity) => classEntity.students)
  enrolledClasses: Class[];

  @ManyToMany(() => User, (user) => user.classes)
  users: User[];

  @OneToMany(() => Assignment, (assignment) => assignment.teacher)
  createdAssignments: Assignment[];

  @OneToMany(() => Submission, (submission) => submission.student)
  submissions: Submission[];

  @OneToMany(() => Announcement, (announcement) => announcement.teacher)
  announcements: Announcement[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}

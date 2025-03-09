import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { UserRole } from '../../auth/dto/register.dto';

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

  @OneToMany(() => Class, (classEntity) => classEntity.teacher)
  createdClasses: Class[];

  @ManyToMany(() => Class, (classEntity) => classEntity.students)
  enrolledClasses: Class[];
}

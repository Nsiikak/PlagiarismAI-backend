import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(teacherId: string, createClassDto: CreateClassDto) {
    const teacher = await this.usersRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) throw new NotFoundException('Teacher not found');

    const newClass = this.classesRepository.create({
      ...createClassDto,
      teacher,
    });

    const savedClass = await this.classesRepository.save(newClass);

    // Send notification to teacher with class code
    await this.notificationsService.sendToUser(
      teacherId,
      `Class "${savedClass.name}" created successfully. Class code: ${savedClass.classCode}`,
    );

    return savedClass;
  }

  async joinClassByCode(studentId: string, classCode: string) {
    const classEntity = await this.classesRepository.findOne({
      where: { classCode },
      relations: ['students', 'teacher'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    if (!classEntity.isActive) {
      throw new ForbiddenException(
        'This class is no longer accepting new students',
      );
    }

    const student = await this.usersRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if student is already enrolled
    if (classEntity.students.some((s) => s.id === studentId)) {
      throw new ConflictException('You are already enrolled in this class');
    }

    classEntity.students.push(student);
    const updatedClass = await this.classesRepository.save(classEntity);

    // Notify teacher of new student
    await this.notificationsService.sendToUser(
      classEntity.teacher.id,
      `New student ${student.fullName} joined your class "${classEntity.name}"`,
    );

    return updatedClass;
  }

  async getUserClasses(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['createdClasses', 'enrolledClasses'],
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      createdClasses: user.createdClasses,
      enrolledClasses: user.enrolledClasses,
    };
  }

  async findOne(id: string) {
    const classEntity = await this.classesRepository.findOne({
      where: { id },
      relations: ['teacher', 'students'],
    });

    if (!classEntity) throw new NotFoundException('Class not found');
    return classEntity;
  }

  async getClassStudents(classId: string) {
    const classEntity = await this.findOne(classId);
    return classEntity.students;
  }

  async deactivateClass(teacherId: string, classId: string) {
    const classEntity = await this.findOne(classId);

    if (classEntity.teacher.id !== teacherId) {
      throw new UnauthorizedException(
        'You can only deactivate your own classes',
      );
    }

    classEntity.isActive = false;
    return this.classesRepository.save(classEntity);
  }

  async removeStudent(teacherId: string, classId: string, studentId: string) {
    const classEntity = await this.findOne(classId);

    if (classEntity.teacher.id !== teacherId) {
      throw new UnauthorizedException(
        'You can only remove students from your own classes',
      );
    }

    classEntity.students = classEntity.students.filter(
      (student) => student.id !== studentId,
    );
    return this.classesRepository.save(classEntity);
  }

  async deleteClass(teacherId: string, classId: string) {
    const classEntity = await this.findOne(classId);

    if (classEntity.teacher.id !== teacherId) {
      throw new UnauthorizedException('You can only delete your own classes');
    }

    await this.classesRepository.remove(classEntity);
    return { message: 'Class deleted successfully' };
  }
}

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
// import { plainToClass } from 'class-transformer';

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
    const { name } = createClassDto;

    // Check if the teacher exists
    const teacher = await this.usersRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) throw new NotFoundException('Teacher not found');

    // Check if a class with the same name already exists for the teacher
    const existingClass = await this.classesRepository.findOne({
      where: { name, teacher: { id: teacherId } },
    });

    if (existingClass) {
      throw new ConflictException(`Class with name "${name}" already exists.`);
    }

    // Create the new class
    const newClass = this.classesRepository.create({
      ...createClassDto,
      teacher,
    });

    const savedClass = await this.classesRepository.save(newClass);

    // Send notification to the teacher with the class code
    await this.notificationsService.sendToUser(
      teacherId,
      `Class "${savedClass.name}" created successfully. Class code: ${savedClass.classCode}`,
    );

    return savedClass;
  }

  async joinClassByCode(studentId: string, classCode: string) {
    console.log(`Student ID (parameter): ${studentId}`);
    console.log(`Class Code: ${classCode}`);

    const classEntity = await this.classesRepository.findOne({
      where: { classCode },
      relations: ['students', 'teacher'],
    });

    if (!classEntity) {
      console.error('Class not found');
      throw new NotFoundException('Class not found');
    }

    console.log('Class Entity:', classEntity);

    if (!classEntity.isActive) {
      console.error('Class is no longer accepting new students');
      throw new ForbiddenException(
        'This class is no longer accepting new students',
      );
    }

    const student = await this.usersRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      console.error('Student not found in the database');
      throw new NotFoundException('Student not found');
    }

    console.log('Student Retrieved:', student);

    if (student.role !== 'student') {
      console.error(`Invalid Role: ${student.role}`);
      throw new ForbiddenException('Only students can join this class');
    }

    if (classEntity.students.some((s) => s.id === studentId)) {
      console.error('Student is already enrolled');
      throw new ConflictException('You are already enrolled in this class');
    }

    console.log(
      `Enrolling student ${student.fullName} in class ${classEntity.name}`,
    );
    classEntity.students.push(student);

    const updatedClass = await this.classesRepository.save(classEntity);

    console.log(`Class updated: ${updatedClass}`);

    // Notify the teacher about the new student
    await this.notificationsService.sendToUser(
      classEntity.teacher.id,
      `New student ${student.fullName} joined your class "${classEntity.name}"`,
    );

    console.log('Notification sent to teacher');
    return updatedClass;
  }
  async getUserClasses(userId: string) {
    // Get the user details
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    // Get the classes created by the user
    const createdClasses = await this.classesRepository.find({
      where: { teacher: user },
    });

    // Get the classes the user is enrolled in and include the teacher's full name
    const enrolledClasses = await this.classesRepository
      .createQueryBuilder('class')
      .innerJoin('class.students', 'student', 'student.id = :userId', {
        userId,
      })
      .leftJoinAndSelect('class.teacher', 'teacher') // Join the teacher relationship
      .select([
        'class.id',
        'class.name',
        'class.description',
        'class.classCode',
        'class.isActive',
        'teacher.fullName', // Include teacher's full name
      ])
      .getMany();

    // Map enrolled classes to include teacherFullName
    const formattedEnrolledClasses = enrolledClasses.map((classItem) => ({
      ...classItem,
      teacherFullName: classItem.teacher?.fullName || null, // Add teacher's full name
    }));

    return {
      createdClasses,
      enrolledClasses: formattedEnrolledClasses,
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

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(matricOrStaffId: string, createClassDto: CreateClassDto) {
    const teacher = await this.usersRepository.findOne({
      where: { id: matricOrStaffId },
    });

    if (!teacher) throw new NotFoundException('Teacher not found');

    const newClass = this.classesRepository.create({
      ...createClassDto,
      teacher,
    });
    return this.classesRepository.save(newClass);
  }

  async joinClass(studentId: string, classId: string) {
    const classEntity = await this.classesRepository.findOne({
      where: { id: classId },
      relations: ['students'],
    });

    if (!classEntity) throw new NotFoundException('Class not found');

    const student = await this.usersRepository.findOne({
      where: { id: studentId },
    });

    if (!student) throw new NotFoundException('Student not found');

    classEntity.students.push(student);
    return this.classesRepository.save(classEntity);
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

  async deleteClass(teacherId: string, classId: string) {
    const classEntity = await this.classesRepository.findOne({
      where: { id: classId },
      relations: ['teacher'],
    });

    if (!classEntity) throw new NotFoundException('Class not found');

    if (classEntity.teacher.id !== teacherId) {
      throw new UnauthorizedException('You are not the owner of this class');
    }

    await this.classesRepository.remove(classEntity);
    return { message: 'Class deleted successfully' };
  }
}

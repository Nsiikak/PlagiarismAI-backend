import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { JoinClassDto } from './dto/join-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('create')
  @Roles(UserRole.TEACHER)
  async create(@Request() req, @Body() createClassDto: CreateClassDto) {
    return await this.classesService.create(req.user.userId, createClassDto);
  }

  @Post('join')
  @Roles(UserRole.STUDENT)
  async joinClassByCode(@Request() req, @Body() joinClassDto: JoinClassDto) {
    return this.classesService.joinClassByCode(
      req.user.userId,
      joinClassDto.classCode,
    );
  }

  @Get('my-classes')
  async getMyClasses(@Request() req) {
    return this.classesService.getUserClasses(req.user.userId);
  }

  @Get(':id/students')
  @Roles(UserRole.TEACHER)
  async getClassStudents(@Request() req, @Param('id') classId: string) {
    const classEntity = await this.classesService.findOne(classId);
    if (classEntity.teacher.id !== req.user.userId) {
      throw new ForbiddenException(
        'You can only view students in your own classes',
      );
    }
    return this.classesService.getClassStudents(classId);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER)
  async deleteClass(@Request() req, @Param('id') classId: string) {
    return this.classesService.deleteClass(req.user.userId, classId);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.TEACHER)
  async deactivateClass(@Request() req, @Param('id') classId: string) {
    return this.classesService.deactivateClass(req.user.userId, classId);
  }

  @Post(':id/remove-student/:studentId')
  @Roles(UserRole.TEACHER)
  async removeStudent(
    @Request() req,
    @Param('id') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classesService.removeStudent(
      req.user.userId,
      classId,
      studentId,
    );
  }
}

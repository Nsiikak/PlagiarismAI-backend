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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { JoinClassDto } from './dto/join-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@ApiTags('Classes')
@ApiBearerAuth() // Adds a security scheme for JWT
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('create')
  @Roles(UserRole.TEACHER, UserRole.teacher)
  @ApiOperation({ summary: 'Create a new class (Teachers only)' })
  @ApiResponse({ status: 201, description: 'Class created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only teachers can create classes.',
  })
  async create(@Request() req, @Body() createClassDto: CreateClassDto) {
    return await this.classesService.create(req.user.Id, createClassDto);
  }

  @Post('join')
  @Roles(UserRole.STUDENT, UserRole.student)
  @ApiOperation({ summary: 'Join a class using a class code (Students only)' })
  @ApiResponse({ status: 200, description: 'Class joined successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only students can join classes.',
  })
  async joinClassByCode(@Request() req, @Body() joinClassDto: JoinClassDto) {
    console.log(`Request User Info:`, req.user);
    return this.classesService.joinClassByCode(
      req.user.id, // Ensure this is not undefined
      joinClassDto.classCode,
    );
  }

  @Get('my-classes')
  @ApiOperation({ summary: 'Get all classes for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully.' })
  async getMyClasses(@Request() req) {
    return this.classesService.getUserClasses(req.user.userId);
  }

  @Get(':id/students')
  @Roles(UserRole.TEACHER, UserRole.teacher)
  @ApiOperation({
    summary: 'Get all students in a specific class (Teachers only)',
  })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You can only view students in your own classes.',
  })
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
  @Roles(UserRole.TEACHER, UserRole.teacher)
  @ApiOperation({ summary: 'Delete a class (Teachers only)' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only teachers can delete classes.',
  })
  async deleteClass(@Request() req, @Param('id') classId: string) {
    return this.classesService.deleteClass(req.user.userId, classId);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.TEACHER, UserRole.teacher)
  @ApiOperation({ summary: 'Deactivate a class (Teachers only)' })
  @ApiResponse({ status: 200, description: 'Class deactivated successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only teachers can deactivate classes.',
  })
  async deactivateClass(@Request() req, @Param('id') classId: string) {
    return this.classesService.deactivateClass(req.user.userId, classId);
  }

  @Post(':id/remove-student/:studentId')
  @Roles(UserRole.TEACHER, UserRole.teacher)
  @ApiOperation({ summary: 'Remove a student from a class (Teachers only)' })
  @ApiResponse({
    status: 200,
    description: 'Student removed from class successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only teachers can remove students from classes.',
  })
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

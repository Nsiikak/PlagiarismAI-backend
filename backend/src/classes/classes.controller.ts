import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  create(@Request() req, @Body() createClassDto: CreateClassDto) {
    return this.classesService.create(req.user.userId, createClassDto);
  }

  @Post('join/:classId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  joinClass(@Request() req, @Param('classId') classId: string) {
    return this.classesService.joinClass(req.user.userId, classId);
  }

  @Get('my-classes')
  @UseGuards(JwtAuthGuard)
  getMyClasses(@Request() req) {
    return this.classesService.getUserClasses(req.user.userId);
  }

  @Delete('delete/:classId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  deleteClass(@Request() req, @Param('classId') classId: string) {
    return this.classesService.deleteClass(req.user.userId, classId);
  }
}

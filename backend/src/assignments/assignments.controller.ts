import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AssignmentsService } from './assignments.service';
import * as Multer from 'multer';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
// import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  create(@Request() req, @Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(req.user.userId, createAssignmentDto);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) =>
          callback(null, `${Date.now()}-${file.originalname}`),
      }),
      fileFilter: (req, file, callback) => {
        if (
          file.mimetype === 'text/plain' ||
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          callback(null, true);
        } else {
          callback(new Error('Only .txt and .docx files are allowed'), false);
        }
      },
    }),
  )
  submit(
    @Request() req,
    @Param('id') assignmentId: string,
    @UploadedFile() file: Multer.File,
    // @UploadedFile() file: Express.Multer.File,
  ) {
    return this.assignmentsService.submit(
      req.user.userId,
      assignmentId,
      file.path,
    );
  }

  @Post(':id/grade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  grade(
    @Param('id') submissionId: string,
    @Body() gradeDto: GradeAssignmentDto,
  ) {
    return this.assignmentsService.grade(submissionId, gradeDto);
  }

  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getSubmissions(@Param('id') assignmentId: string) {
    return this.assignmentsService.getSubmissions(assignmentId);
  }
}

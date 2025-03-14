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
// import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';

@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly httpService: HttpService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FileInterceptor('markingGuide'))
  async create(
    @Request() req,
    @Body() createAssignmentDto: CreateAssignmentDto,
    @UploadedFile() markingGuide?: Multer.File,
  ) {
    if (markingGuide) {
      createAssignmentDto.markingGuide = await fs.promises.readFile(
        markingGuide.path,
        'utf8',
      );
    }
    return this.assignmentsService.create(req.user.userId, createAssignmentDto);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(txt|docx|pdf)$/)) {
          return callback(
            new Error('Only .txt, .docx, and .pdf files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async submit(
    @Request() req,
    @Param('id') assignmentId: string,
    @UploadedFile() file: Multer.File,
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
  async grade(@Param('id') submissionId: string) {
    return this.assignmentsService.gradeSubmission(submissionId);
  }

  @Post(':id/check-plagiarism')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async checkPlagiarism(@Param('id') submissionId: string) {
    return this.assignmentsService.checkPlagiarism(submissionId);
  }

  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  getSubmissions(@Param('id') assignmentId: string) {
    return this.assignmentsService.getSubmissions(assignmentId);
  }
}

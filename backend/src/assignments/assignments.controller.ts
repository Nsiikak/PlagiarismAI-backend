import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { Multer } from 'multer';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('create')
  @Roles(UserRole.TEACHER, UserRole.teacher)
  async create(
    @Request() req,
    @Body() createAssignmentDto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.create(req.user.id, createAssignmentDto);
  }

  @Post(':id/submit')
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
    return this.assignmentsService.submit(req.user.id, assignmentId, file.path);
  }

  @Post(':id/grade')
  @Roles(UserRole.TEACHER)
  async grade(@Param('id') submissionId: string) {
    return this.assignmentsService.gradeSubmission(submissionId);
  }

  @Post(':id/check-plagiarism')
  @Roles(UserRole.TEACHER)
  async checkPlagiarism(@Param('id') submissionId: string) {
    return this.assignmentsService.checkPlagiarism(submissionId);
  }

  @Get(':id/submissions')
  @Roles(UserRole.TEACHER)
  getSubmissions(@Param('id') assignmentId: string) {
    return this.assignmentsService.getSubmissions(assignmentId);
  }
}

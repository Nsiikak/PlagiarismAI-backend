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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { Multer } from 'multer';

@ApiTags('Assignments') // Group under "Assignments" in Swagger
@ApiBearerAuth() // Require JWT Authentication
@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('create')
  @Roles(UserRole.TEACHER, UserRole.teacher)
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiResponse({ status: 201, description: 'Assignment created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only teachers can create assignments.',
  })
  async create(
    @Request() req,
    @Body() createAssignmentDto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.create(req.user.id, createAssignmentDto);
  }

  @Get('all')
  @Roles(UserRole.TEACHER, UserRole.teacher)
  @ApiOperation({ summary: 'Get all assignments' })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only teachers can view assignments.',
  })
  async getAllAssignments() {
    return this.assignmentsService.getAllAssignments();
  }
  @Post(':id/submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit an assignment' })
  @ApiConsumes('multipart/form-data') // Indicate file upload in Swagger
  @ApiResponse({
    status: 201,
    description: 'Assignment submitted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid file format.' })
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
  @ApiOperation({ summary: 'Grade an assignment submission' })
  @ApiResponse({ status: 200, description: 'Submission graded successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only teachers can grade submissions.',
  })
  async grade(@Param('id') submissionId: string) {
    return this.assignmentsService.gradeSubmission(submissionId);
  }

  @Post(':id/check-plagiarism')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Check plagiarism for a submission' })
  @ApiResponse({
    status: 200,
    description: 'Plagiarism check completed successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only teachers can check plagiarism.',
  })
  async checkPlagiarism(@Param('id') submissionId: string) {
    return this.assignmentsService.checkPlagiarism(submissionId);
  }

  @Get(':id/submissions')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all submissions for an assignment' })
  @ApiResponse({
    status: 200,
    description: 'Submissions retrieved successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only teachers can view submissions.',
  })
  getSubmissions(@Param('id') assignmentId: string) {
    return this.assignmentsService.getSubmissions(assignmentId);
  }
}

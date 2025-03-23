import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { User } from '../users/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignmentType } from './entities/assignment.entity';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly httpService: HttpService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(teacherId: string, dto: CreateAssignmentDto) {
    const teacher = await this.userRepo.findOne({ where: { id: teacherId } });

    if (!teacher) throw new NotFoundException('Teacher not found');

    const assignment = this.assignmentRepo.create({ ...dto, teacher });
    return this.assignmentRepo.save(assignment);
  }
  async getAllAssignments() {
    return this.assignmentRepo.find({ relations: ['teacher', 'class'] });
  }

  async submit(studentId: string, assignmentId: string, fileUrl: string) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const student = await this.userRepo.findOne({ where: { id: studentId } });

    const submission = this.submissionRepo.create({
      student,
      assignment,
      fileUrl,
    });
    return this.submissionRepo.save(submission);
  }

  async grade(submissionId: string, gradeDto) {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });

    submission.grade = gradeDto.score;
    return this.submissionRepo.save(submission);
  }

  async getSubmissions(assignmentId: string) {
    return this.submissionRepo.find({
      where: { assignment: { id: assignmentId } },
      relations: ['student'],
    });
  }

  async gradeSubmission(submissionId: string) {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
      relations: ['student', 'assignment'],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    try {
      let gradingResult;

      switch (submission.assignment.type) {
        // case AssignmentType.MCQ:
        //   gradingResult = await this.gradeMCQ(submission);
        //   break;
        // case AssignmentType.SHORT_ANSWER:
        //   gradingResult = await this.gradeShortAnswer(submission);
        //   break;
        // case AssignmentType.ESSAY:
        //   gradingResult = await this.gradeEssay(submission);
        //   break;
        case AssignmentType.CODE:
          gradingResult = await this.gradeCode(submission);
          break;
        default:
          gradingResult = await this.gradeGeneral(submission);
      }

      submission.grade = gradingResult.score;
      const gradedSubmission = await this.submissionRepo.save(submission);

      await this.notificationsService.sendToUser(
        submission.student.id,
        `Your ${submission.assignment.type} assignment "${submission.assignment.title}" has been graded. Score: ${gradingResult.score}. Feedback: ${gradingResult.feedback}`,
      );

      return gradedSubmission;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error grading submission: ${error.message}`,
      );
    }
  }

  private async gradeGeneral(submission: Submission) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(submission.fileUrl));
    formData.append('marking_guide', submission.assignment.markingGuide);

    const response = await firstValueFrom(
      this.httpService.post(
        'http://127.0.0.1:8000/grade/assignment',
        formData,
        {
          headers: { ...formData.getHeaders() },
        },
      ),
    );

    return {
      score: response.data.grading_result.similarity_score,
      feedback: `Grade: ${response.data.grading_result.grade}`,
    };
  }

  private async gradeCode(submission: Submission) {
    const response = await firstValueFrom(
      this.httpService.post('http://127.0.0.1:8000/grade/code', {
        student_code: fs.readFileSync(submission.fileUrl, 'utf8'),
        test_cases: submission.assignment.testCases,
      }),
    );
    return response.data;
  }

  async checkPlagiarism(submissionId: string) {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
      relations: ['student', 'assignment'],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    try {
      // Get all other submissions for the same assignment
      const otherSubmissions = await this.submissionRepo.find({
        where: {
          assignment: { id: submission.assignment.id },
          id: Not(submissionId),
        },
      });

      let highestSimilarity = 0;
      let similarSubmission = null;

      // Check against each other submission
      for (const other of otherSubmissions) {
        const formData = new FormData();
        formData.append('file1', fs.createReadStream(submission.fileUrl));
        formData.append('file2', fs.createReadStream(other.fileUrl));

        const response = await firstValueFrom(
          this.httpService.post('http://127.0.0.1:8000/plagiarism', formData, {
            headers: { ...formData.getHeaders() },
          }),
        );

        if (
          response.data.plagiarism_result.similarity_score > highestSimilarity
        ) {
          highestSimilarity = response.data.plagiarism_result.similarity_score;
          similarSubmission = other;
        }
      }

      // Update submission with plagiarism score
      submission.plagiarismScore = highestSimilarity;
      const checkedSubmission = await this.submissionRepo.save(submission);

      // Notify teacher if high plagiarism detected
      if (highestSimilarity > 0.7) {
        await this.notificationsService.sendToUser(
          submission.assignment.teacher.id,
          `High plagiarism (${(highestSimilarity * 100).toFixed(2)}%) detected in submission for "${submission.assignment.title}" by ${submission.student.fullName}`,
        );
      }

      return {
        submission: checkedSubmission,
        plagiarismScore: highestSimilarity,
        similarSubmissionId: similarSubmission?.id,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error checking plagiarism: ${error.message}`,
      );
    }
  }
}

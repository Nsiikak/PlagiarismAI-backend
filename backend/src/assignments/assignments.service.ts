import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(teacherId: string, dto: CreateAssignmentDto) {
    const teacher = await this.userRepo.findOne({ where: { id: teacherId } });

    if (!teacher) throw new NotFoundException('Teacher not found');

    const assignment = this.assignmentRepo.create({ ...dto, teacher });
    return this.assignmentRepo.save(assignment);
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
}

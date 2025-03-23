import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Submission } from './entities/submission.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto) {
    const { studentId, assignmentId, fileUrl } = createSubmissionDto;

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

  findAll() {
    return this.submissionRepo.find({ relations: ['student', 'assignment'] });
  }

  async findOne(id: string) {
    const submission = await this.submissionRepo.findOne({
      where: { id },
      relations: ['student', 'assignment'],
    });
    if (!submission) throw new NotFoundException('Submission not found');
    return submission;
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto) {
    const submission = await this.findOne(id);
    Object.assign(submission, updateSubmissionDto);
    return this.submissionRepo.save(submission);
  }

  async remove(id: string) {
    const submission = await this.findOne(id);
    await this.submissionRepo.remove(submission);
  }
}

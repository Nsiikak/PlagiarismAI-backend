import { IsUUID, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  assignmentId: string;

  @IsString()
  fileUrl: string;
}

import { IsUUID } from 'class-validator';

export class SubmitAssignmentDto {
  @IsUUID()
  assignmentId: string;
}

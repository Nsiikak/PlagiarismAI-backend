import { IsNumber, Min, Max } from 'class-validator';

export class GradeAssignmentDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}

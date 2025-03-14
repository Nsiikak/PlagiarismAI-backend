import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { AssignmentType } from '../entities/assignment.entity';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  classId: string;

  @IsEnum(AssignmentType)
  type: AssignmentType;

  @IsOptional()
  @IsString()
  markingGuide?: string;

  @IsOptional()
  testCases?: Record<string, string>;
}

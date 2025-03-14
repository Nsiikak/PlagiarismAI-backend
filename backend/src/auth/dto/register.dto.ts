import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export enum UserRole {
  STUDENT = 'STUDENT',
  student = 'student',
  TEACHER = 'TEACHER',
  teacher = 'teacher',
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  matricOrStaffId: string; // Matric Number (Student) or Staff ID (Teacher)

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}

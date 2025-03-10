import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  matricOrStaffId: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['student', 'teacher'])
  role: 'student' | 'teacher';
}

import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  matricOrStaffId: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['student', 'teacher'])
  role: 'student' | 'teacher';
}

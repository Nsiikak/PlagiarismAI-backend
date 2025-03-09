import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Can be Matric Number (Student) or Staff ID (Teacher)

  @IsString()
  @IsNotEmpty()
  password: string;
}

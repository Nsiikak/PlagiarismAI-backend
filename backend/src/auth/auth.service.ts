import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RegisterDto, UserRole } from '../auth/dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const newUser = this.usersRepository.create({
        ...registerDto,
        password: hashedPassword,
      });

      await this.usersRepository.save(newUser);
      return { message: 'User registered successfully' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // User already exists
      }
      throw new InternalServerErrorException('User registration failed');
    }
  }
  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: [{ matricOrStaffId: loginDto.matricOrStaffId }],
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      matricOrStaffId: user.matricOrStaffId,
      role: user.role,
    };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
    console.log('Login response:', {
      token,
      user: {
        id: user.id,
        matricOrStaffId: user.matricOrStaffId,
        role: user.role,
      },
    });

    return { access_token: token };
  }
}

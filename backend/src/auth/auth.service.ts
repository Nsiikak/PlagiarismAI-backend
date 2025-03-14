import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const existingUser = await this.usersService.findByMatricOrStaffId(
        registerDto.matricOrStaffId,
      );

      if (existingUser) {
        throw new ConflictException('User with this ID already exists');
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
        throw error;
      }
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByMatricOrStaffId(
      loginDto.matricOrStaffId,
    );

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      matricOrStaffId: user.matricOrStaffId,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        matricOrStaffId: user.matricOrStaffId,
        role: user.role,
      },
    };
  }
}

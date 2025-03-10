import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'src/auth/dto/register.dto';
import { LoginDto } from '../../src/auth/dto/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    // private jwtService: JwtService,
  ) {}

  // Create a new user (Registration)
  async createUser(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { fullName, email, matricOrStaffId, password, role } = createUserDto;

    try {
      // Check if user already exists
      const existingUser = await this.userRepo.findOne({
        where: { matricOrStaffId },
      });

      if (existingUser) {
        throw new ConflictException('User with this ID already exists');
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepo.create({
        fullName,
        email,
        matricOrStaffId,
        password: hashedPassword,
        role: role as UserRole,
      });

      await this.userRepo.save(newUser);

      return { message: 'User registered successfully' };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw conflict exception
      }

      throw new InternalServerErrorException('User registration failed');
    }
  }

  //login
  async login(loginDto: LoginDto): Promise<{ message: string }> {
    const { matricOrStaffId, password } = loginDto;

    // Check if the user exists
    const user = await this.userRepo.findOne({ where: { matricOrStaffId } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { message: 'Login successful' };
  }

  // Get all users
  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  // Get a single user by ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Update a user's details
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);

    return this.userRepo.save(user);
  }

  // Delete a user
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }

  // Find a user by Matric/Staff ID (For login/authentication)
  async findByMatricOrStaffId(
    matricOrStaffId: string,
  ): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { matricOrStaffId } });
  }
}

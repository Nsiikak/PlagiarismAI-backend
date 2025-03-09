import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'src/auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Create a new user (Registration)
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { matricOrStaffId, password, role } = createUserDto;

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
      matricOrStaffId,
      password: hashedPassword,
      role: role as UserRole,
    });

    return await this.userRepo.save(newUser);
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

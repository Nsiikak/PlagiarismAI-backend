import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

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

  // Find by matricOrStaffId (used by auth service)
  async findByMatricOrStaffId(
    matricOrStaffId: string,
  ): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { matricOrStaffId } });
  }

  // Update a user's details
  // async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
  //   const user = await this.findOne(id);
  //   Object.assign(user, updateUserDto);
  //   return this.userRepo.save(user);
  // }

  // Delete a user
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }
}

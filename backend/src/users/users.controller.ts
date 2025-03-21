import {
  Controller,
  Get,
  // Patch,
  Param,
  Delete,
  UseGuards,
  // Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger'; // Import Swagger decorators
import { UsersService } from './users.service';
// import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@ApiTags('Users') // Group the endpoints under "Users" in Swagger
@ApiBearerAuth() // Add JWT authentication to all endpoints
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.TEACHER, UserRole.teacher)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users.',
  }) // Add operation summary and description
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only authorized users can access this endpoint.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve details of a user by their ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    example: '123',
  }) // Document the ID parameter
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Update a user', description: 'Update details of an existing user.' })
  // @ApiParam({ name: 'id', description: 'Unique identifier of the user', example: '123' })
  // @ApiBody({ type: UpdateUserDto }) // Document the request body
  // @ApiResponse({ status: 200, description: 'User updated successfully.' })
  // @ApiResponse({ status: 404, description: 'User not found.' })
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(id, updateUserDto);
  // }

  @Delete(':id')
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Remove a user by their ID. Only TEACHER role can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    example: '123',
  })
  @ApiResponse({ status: 200, description: 'User removed successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only authorized users can perform this action.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

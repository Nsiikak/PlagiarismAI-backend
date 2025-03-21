import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Request,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications') // Group all routes under "Notifications"
@ApiBearerAuth() // Add JWT authentication to all endpoints
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Get all notifications for the logged-in user
  @Get('my-notifications')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user notifications',
    description: 'Retrieve all notifications for the logged-in user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notifications retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  getMyNotifications(@Request() req) {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  // Create a new notification
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a notification',
    description: 'Create a new notification for internal services.',
  })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid input data.' })
  createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  // Mark a notification as read
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read.',
  })
  @ApiParam({ name: 'id', description: 'Notification ID', example: '123' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully.',
  })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markNotificationAsRead(id);
  }

  // Send a notification to a specific user
  @Post('send-to-user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Send notification to a user',
    description: 'Send a notification to a specific user by their ID.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to send the notification to',
    example: '456',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'This is a test notification.' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Notification sent to the user successfully.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async sendToUser(
    @Param('userId') userId: string,
    @Body() body: { message: string },
  ) {
    return this.notificationsService.sendToUser(userId, body.message);
  }

  // Send a notification to all students in a class
  @Post('send-to-class/:classId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Send notification to a class',
    description: 'Send a notification to all students in a specific class.',
  })
  @ApiParam({
    name: 'classId',
    description: 'Class ID to send the notification to',
    example: '789',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Assignment Update' },
        message: {
          type: 'string',
          example: 'Your assignment deadline has been extended.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Notification sent to the class successfully.',
  })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  async sendToClass(
    @Param('classId') classId: string,
    @Body() body: { title: string; message: string },
  ) {
    return this.notificationsService.sendToClass(
      classId,
      body.title,
      body.message,
    );
  }

  // Delete a notification
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a notification',
    description: 'Delete a specific notification by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID to delete',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }
}

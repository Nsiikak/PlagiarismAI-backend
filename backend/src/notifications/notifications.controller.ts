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
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Get all notifications for the logged-in user
  @Get('my-notifications')
  @UseGuards(JwtAuthGuard)
  getMyNotifications(@Request() req) {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  // Create a new notification (used internally by services like assignments, announcements, etc.)
  @Post('create')
  @UseGuards(JwtAuthGuard)
  createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  // Mark a notification as read
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markNotificationAsRead(id);
  }
  // Send a notification to a specific user
  @Post('send-to-user/:userId')
  @UseGuards(JwtAuthGuard)
  async sendToUser(
    @Param('userId') userId: string,
    @Body() body: { message: string },
  ) {
    return this.notificationsService.sendToUser(userId, body.message);
  }

  // Send a notification to all students in a class
  @Post('send-to-class/:classId')
  @UseGuards(JwtAuthGuard)
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
  deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }
}

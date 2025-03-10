import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  // Fetch all notifications for a specific user
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Create a new notification
  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );
    return this.notificationsRepository.save(notification);
  }

  // Mark a notification as read
  async markNotificationAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }
  async sendToUser(userId: string, message: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    const notification = this.notificationsRepository.create({ message, user });
    await this.notificationsRepository.save(notification);
  }

  async sendToClass(classId: string, title: string, message: string) {
    const users = await this.userRepo.find({
      where: { classes: { id: classId } },
    });

    for (const user of users) {
      await this.sendToUser(user.id, `${title}: ${message}`);
    }
  }

  // Delete a notification
  async deleteNotification(id: string): Promise<void> {
    const result = await this.notificationsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }
}

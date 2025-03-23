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
  async markNotificationAsRead(
    userId: string,
    notificationId: string,
  ): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found for user ${userId}`,
      );
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
    // Load users and their enrolled classes
    const users = await this.userRepo.find({
      relations: ['enrolledClasses'], // Explicitly load the enrolledClasses relationship
    });

    // Filter users who are part of the specific class
    const filteredUsers = users.filter((user) =>
      user.enrolledClasses.some(
        (enrolledClass) => enrolledClass.id === classId,
      ),
    );

    // Send notifications to the filtered users
    for (const user of filteredUsers) {
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

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { Announcement } from './entities/announcement.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from 'src/users/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement, User, Notification])],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, NotificationsService],
})
export class AnnouncementsModule {}

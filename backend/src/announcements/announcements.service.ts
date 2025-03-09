import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(teacherId: string, dto: CreateAnnouncementDto) {
    const teacher = await this.userRepo.findOne({ where: { id: teacherId } });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const announcement = this.announcementRepo.create({ ...dto, teacher });
    await this.announcementRepo.save(announcement);

    await this.notificationsService.sendToClass(
      dto.classId,
      'New Announcement',
      dto.title,
    );

    return announcement;
  }

  async getByClass(classId: string) {
    return this.announcementRepo.find({ where: { class: { id: classId } } });
  }
}

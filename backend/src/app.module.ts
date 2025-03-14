import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ClassesModule } from './classes/classes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from 'database/database.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ClassesModule,
    AssignmentsModule,
    NotificationsModule,
    SubmissionsModule,
    HttpModule,
  ],
  exports: [HttpModule],
})
export class AppModule {}

import { NotificationController } from '@/notification/api/notification.controller';
import { NotificationService } from '@/notification/domain/notification.service';
import { NotificationGateway } from '@/notification/gateway/notification.gateway';
import { PrismaModule } from '@/Prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CreateNotificationAction } from './domain/actions/create-notification.action';
import { FindAllByUserAction } from './domain/actions/find-all-by-user.action';
import { GetUnreadCountAction } from './domain/actions/get-unread-count.action';
import { MarkAllAsReadAction } from './domain/actions/mark-all-as-read.action';
import { MarkAsReadAction } from './domain/actions/mark-as-read.action';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn')
        }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [NotificationController],
  providers: [
    NotificationGateway,
    CreateNotificationAction,
    FindAllByUserAction,
    GetUnreadCountAction,
    MarkAsReadAction,
    MarkAllAsReadAction,
    NotificationService
  ],
  exports: [NotificationService, CreateNotificationAction],
})
export class NotificationModule { } 
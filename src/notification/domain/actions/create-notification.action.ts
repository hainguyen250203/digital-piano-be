import { PrismaService } from '@/Prisma/prisma.service';
import { ReqCreateNotificationDto } from '@/notification/api/dto/req-create-notification.dto';
import { ResNotificationDto } from '@/notification/api/dto/res-notification.dto';
import { NotificationGateway } from '@/notification/gateway/notification.gateway';
import { Injectable, Logger } from '@nestjs/common';
import { mapToNotificationDto } from '../utils/notification.mapper';

@Injectable()
export class CreateNotificationAction {
  private logger = new Logger(CreateNotificationAction.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  async execute(dto: ReqCreateNotificationDto): Promise<ResNotificationDto> {
    this.logger.log(`Creating notification: ${JSON.stringify(dto)}`);

    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        content: dto.content,
        type: dto.type,
      },
    });

    this.logger.log(`Notification created with ID: ${notification.id}`);
    const mappedNotification = mapToNotificationDto(notification);

    if (dto.userId) {
      this.logger.log(`Sending notification to user: ${dto.userId}`);
      this.notificationGateway.sendNotificationToUser(dto.userId, mappedNotification);
    } else {
      this.logger.log('Broadcasting notification to all users');
      this.notificationGateway.broadcastNotification(mappedNotification);
    }

    return mappedNotification;
  }
} 
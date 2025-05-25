import { PrismaService } from '@/Prisma/prisma.service';
import { ResNotificationDto } from '@/notification/api/dto/res-notification.dto';
import { Injectable } from '@nestjs/common';
import { mapToNotificationDto } from '../utils/notification.mapper';

@Injectable()
export class FindAllByUserAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<ResNotificationDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications.map(mapToNotificationDto);
  }
} 
import { PrismaService } from '@/Prisma/prisma.service';
import { ResNotificationDto } from '@/notification/api/dto/res-notification.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { mapToNotificationDto } from '../utils/notification.mapper';

@Injectable()
export class MarkAsReadAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, userId: string): Promise<ResNotificationDto> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return mapToNotificationDto(updated);
  }
} 
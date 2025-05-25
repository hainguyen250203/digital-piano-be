import { ResNotificationDto } from '@/notification/api/dto/res-notification.dto';
import { Notification } from '@prisma/client';

export const mapToNotificationDto = (notification: Notification): ResNotificationDto => ({
  ...notification,
  userId: notification.userId || undefined,
  content: notification.content || undefined,
  type: notification.type || undefined,
}); 
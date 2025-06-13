import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { SalesStats } from '../types/statistics.types';
import { formatStatusData, groupByDate } from '../utils/statistics.utils';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class SalesStatisticsAction {
  constructor(private prisma: PrismaService) { }

  async execute(): Promise<SalesStats> {
    const [ordersByStatus, ordersByPaymentStatus, ordersByDateRaw] = await Promise.all([
      this.getOrdersByStatus(),
      this.getOrdersByPaymentStatus(),
      this.getOrdersByDate(),
    ]);

    const ordersByDate = groupByDate(ordersByDateRaw);
    const totalOrders = ordersByDate.reduce((sum, item) => sum + item.count, 0);

    return {
      ordersByStatus: formatStatusData(ordersByStatus, 'orderStatus'),
      ordersByPaymentStatus: formatStatusData(ordersByPaymentStatus, 'paymentStatus'),
      ordersByDate,
      totalOrders,
    };
  }

  private async getOrdersByStatus() {
    return this.prisma.order.groupBy({
      by: ['orderStatus'],
      _count: true,
    });
  }

  private async getOrdersByPaymentStatus() {
    return this.prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: true,
    });
  }

  private async getOrdersByDate() {
    return this.prisma.order.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

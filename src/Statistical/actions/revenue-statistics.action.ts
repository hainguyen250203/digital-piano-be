import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { RevenueStats } from '../types/statistics.types';
import { calculateTotal, formatDate } from '../utils/statistics.utils';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class RevenueStatisticsAction {
  constructor(private prisma: PrismaService) { }

  async execute(): Promise<RevenueStats> {
    const revenueByDateAndMethod = await this.getRevenueByDateAndMethod();
    const revenueByDate = this.groupRevenueByDate(revenueByDateAndMethod);
    const totalRevenue = calculateTotal(revenueByDate);

    return {
      revenueByDate,
      totalRevenue,
    };
  }

  private async getRevenueByDateAndMethod() {
    return this.prisma.order.groupBy({
      by: ['createdAt', 'paymentMethod'],
      where: {
        paymentStatus: PaymentStatus.paid,
        orderStatus: OrderStatus.delivered,
      },
      _sum: {
        orderTotal: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  private groupRevenueByDate(revenueData: any[]): Record<string, any>[] {
    return Object.values(
      revenueData.reduce((acc, item) => {
        const date = formatDate(item.createdAt);
        if (!acc[date]) {
          acc[date] = { date };
        }
        acc[date][item.paymentMethod] = item._sum.orderTotal || 0;
        return acc;
      }, {} as Record<string, any>)
    );
  }
}

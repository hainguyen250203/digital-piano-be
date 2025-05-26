import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { TimePeriod } from '../api/dto/get-sales-statistics.dto';
import { GetTimeRangeStatisticsParams } from '../queries/params/get-statistics.params';

@Injectable()
export class SalesStatisticsAction {
  constructor(private prisma: PrismaService) {}

  async execute(params: GetTimeRangeStatisticsParams) {
    const { startDate, endDate, period } = params;
    const timeRange = this.getTimeRange(startDate, endDate, period);

    const salesData = await this.getSalesData(timeRange.startDate, timeRange.endDate, period);
    
    return {
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
      period: period || 'custom',
      data: salesData,
    };
  }

  private getTimeRange(startDate?: Date, endDate?: Date, period?: TimePeriod) {
    const now = new Date();
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    if (period && !startDate && !endDate) {
      end = new Date(now);
      
      switch (period) {
        case TimePeriod.DAY:
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          break;
        case TimePeriod.WEEK:
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          break;
        case TimePeriod.MONTH:
          start = new Date(now);
          start.setMonth(now.getMonth() - 1);
          break;
        case TimePeriod.YEAR:
          start = new Date(now);
          start.setFullYear(now.getFullYear() - 1);
          break;
      }
    }

    return { startDate: start, endDate: end };
  }

  private async getSalesData(startDate: Date, endDate: Date, period?: TimePeriod) {
    const formatOption = this.getFormatOption(period);
    
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['orderStatus'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    const ordersByPaymentStatus = await this.prisma.order.groupBy({
      by: ['paymentStatus'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    const ordersByDate = await this.getOrdersByTimeInterval(startDate, endDate, formatOption);

    return {
      ordersByStatus: this.formatOrderStatusData(ordersByStatus),
      ordersByPaymentStatus: this.formatPaymentStatusData(ordersByPaymentStatus),
      ordersByDate,
      totalOrders: ordersByDate.reduce((sum, item) => sum + Number(item.count), 0),
    };
  }

  private getFormatOption(period?: TimePeriod) {
    switch (period) {
      case TimePeriod.DAY:
        return { format: '%Y-%m-%d %H:00', interval: 'hour' };
      case TimePeriod.WEEK:
        return { format: '%Y-%m-%d', interval: 'day' };
      case TimePeriod.MONTH:
        return { format: '%Y-%m-%d', interval: 'day' };
      case TimePeriod.YEAR:
        return { format: '%Y-%m', interval: 'month' };
      default:
        // Determine format based on date range
        return { format: '%Y-%m-%d', interval: 'day' };
    }
  }

  private async getOrdersByTimeInterval(startDate: Date, endDate: Date, formatOption: { format: string, interval: string }) {
    // Use a simpler approach with an alias for the date_trunc column
    const result = await this.prisma.$queryRaw`
      SELECT 
        date_trunc(${formatOption.interval}, "createdAt") as trunc_date,
        COUNT(*) as count
      FROM "Order"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      GROUP BY trunc_date
      ORDER BY trunc_date
    `;

    // Format the date and convert BigInt to regular number
    return (result as any[]).map(item => ({
      date: new Date(item.trunc_date).toISOString().split('T')[0], // Format as YYYY-MM-DD
      count: Number(item.count)
    }));
  }

  private formatOrderStatusData(data: any[]) {
    const statusMap: Record<string, number> = {};
    
    // Initialize all statuses to 0
    Object.values(OrderStatus).forEach(status => {
      statusMap[status] = 0;
    });
    
    // Fill in actual values
    data.forEach(item => {
      statusMap[item.orderStatus] = item._count;
    });
    
    return Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));
  }

  private formatPaymentStatusData(data: any[]) {
    const statusMap: Record<string, number> = {};
    
    // Initialize all statuses to 0
    Object.values(PaymentStatus).forEach(status => {
      statusMap[status] = 0;
    });
    
    // Fill in actual values
    data.forEach(item => {
      statusMap[item.paymentStatus] = item._count;
    });
    
    return Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));
  }
} 
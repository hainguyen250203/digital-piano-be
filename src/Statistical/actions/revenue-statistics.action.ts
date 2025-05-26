import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { TimePeriod } from '../api/dto/get-sales-statistics.dto';
import { GetTimeRangeStatisticsParams } from '../queries/params/get-statistics.params';

@Injectable()
export class RevenueStatisticsAction {
  constructor(private prisma: PrismaService) {}

  async execute(params: GetTimeRangeStatisticsParams) {
    const { startDate, endDate, period } = params;
    const timeRange = this.getTimeRange(startDate, endDate, period);

    const revenueData = await this.getRevenueData(timeRange.startDate, timeRange.endDate, period);
    
    return {
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
      period: period || 'custom',
      data: revenueData,
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

  private async getRevenueData(startDate: Date, endDate: Date, period?: TimePeriod) {
    const formatOption = this.getFormatOption(period);
    
    // Total revenue in the period
    const totalRevenue = await this.getTotalRevenue(startDate, endDate);
    
    // Revenue by date interval
    const revenueByDate = await this.getRevenueByTimeInterval(startDate, endDate, formatOption);
    
    // Average order value
    const avgOrderValue = await this.getAverageOrderValue(startDate, endDate);

    // Revenue by payment method
    const revenueByPaymentMethod = await this.getRevenueByPaymentMethod(startDate, endDate);
    
    return {
      totalRevenue,
      revenueByDate,
      avgOrderValue,
      revenueByPaymentMethod,
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
        return { format: '%Y-%m-%d', interval: 'day' };
    }
  }

  private async getTotalRevenue(startDate: Date, endDate: Date) {
    const result = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: PaymentStatus.paid,
      },
      _sum: {
        orderTotal: true,
      },
    });
    
    return Number(result._sum.orderTotal || 0);
  }

  private async getAverageOrderValue(startDate: Date, endDate: Date) {
    const result = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: PaymentStatus.paid,
      },
      _avg: {
        orderTotal: true,
      },
    });
    
    return Number(result._avg.orderTotal || 0);
  }

  private async getRevenueByPaymentMethod(startDate: Date, endDate: Date) {
    const result = await this.prisma.order.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: PaymentStatus.paid,
      },
      _sum: {
        orderTotal: true,
      },
    });
    
    return result.map(item => ({
      paymentMethod: item.paymentMethod,
      revenue: Number(item._sum.orderTotal || 0),
    }));
  }

  private async getRevenueByTimeInterval(startDate: Date, endDate: Date, formatOption: { format: string, interval: string }) {
    // Use a simpler approach with an alias for the date_trunc column
    const result = await this.prisma.$queryRaw`
      SELECT 
        date_trunc(${formatOption.interval}, "createdAt") as trunc_date,
        SUM("orderTotal") as revenue
      FROM "Order"
      WHERE "createdAt" >= ${startDate} 
        AND "createdAt" <= ${endDate}
        AND "paymentStatus"::text = ${PaymentStatus.paid}::text
      GROUP BY trunc_date
      ORDER BY trunc_date
    `;

    // Format the date and convert BigInt to regular number
    return (result as any[]).map(item => ({
      date: new Date(item.trunc_date).toISOString().split('T')[0], // Format as YYYY-MM-DD
      revenue: Number(item.revenue)
    }));
  }
} 
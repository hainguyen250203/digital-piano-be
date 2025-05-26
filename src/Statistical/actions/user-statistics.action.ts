import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TimePeriod } from '../api/dto/get-sales-statistics.dto';
import { GetTimeRangeStatisticsParams } from '../queries/params/get-statistics.params';

@Injectable()
export class UserStatisticsAction {
  constructor(private prisma: PrismaService) {}

  async execute(params: GetTimeRangeStatisticsParams) {
    const { startDate, endDate, period } = params;
    const timeRange = this.getTimeRange(startDate, endDate, period);

    const userData = await this.getUserData(timeRange.startDate, timeRange.endDate, period);
    
    return {
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
      period: period || 'custom',
      data: userData,
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

  private async getUserData(startDate: Date, endDate: Date, period?: TimePeriod) {
    const formatOption = this.getFormatOption(period);
    
    // New users in the period
    const newUsers = await this.getNewUsers(startDate, endDate);
    
    // New users by date
    const newUsersByDate = await this.getNewUsersByTimeInterval(startDate, endDate, formatOption);
    
    // Top customers by order count
    const topCustomersByOrderCount = await this.getTopCustomersByOrderCount(startDate, endDate);
    
    // Top customers by spending
    const topCustomersBySpending = await this.getTopCustomersBySpending(startDate, endDate);
    
    // Active users (users who placed orders in the period)
    const activeUsers = await this.getActiveUsers(startDate, endDate);
    
    return {
      totalNewUsers: newUsers.length,
      newUsersByDate,
      totalActiveUsers: activeUsers.length,
      topCustomersByOrderCount,
      topCustomersBySpending,
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

  private async getNewUsers(startDate: Date, endDate: Date) {
    return this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  private async getActiveUsers(startDate: Date, endDate: Date) {
    return this.prisma.user.findMany({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  private async getTopCustomersByOrderCount(startDate: Date, endDate: Date, limit = 10) {
    const users = await this.prisma.user.findMany({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        _count: {
          select: {
            orders: {
              where: {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
        },
      },
      orderBy: {
        orders: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      orderCount: user._count.orders,
    }));
  }

  private async getTopCustomersBySpending(startDate: Date, endDate: Date, limit = 10) {
    // Group orders by user and calculate total spending
    const userOrders = await this.prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        orderTotal: true,
      },
    });

    // Get user details for the top spenders
    const userIds = userOrders
      .sort((a, b) => (b._sum.orderTotal || 0) - (a._sum.orderTotal || 0))
      .slice(0, limit)
      .map(u => u.userId);

    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
      },
    });

    // Combine user details with spending data
    return userIds.map(userId => {
      const user = users.find(u => u.id === userId);
      const orderData = userOrders.find(o => o.userId === userId);
      
      return {
        id: userId,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        totalSpending: orderData?._sum.orderTotal || 0,
      };
    });
  }

  private async getNewUsersByTimeInterval(startDate: Date, endDate: Date, formatOption: { format: string, interval: string }) {
    // Use a simpler approach with an alias for the date_trunc column
    const result = await this.prisma.$queryRaw`
      SELECT 
        date_trunc(${formatOption.interval}, "createdAt") as trunc_date,
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${startDate} 
        AND "createdAt" <= ${endDate}
        AND "isDeleted" = false
      GROUP BY trunc_date
      ORDER BY trunc_date
    `;

    // Format the date and convert BigInt to regular number
    return (result as any[]).map(item => ({
      date: new Date(item.trunc_date).toISOString().split('T')[0], // Format as YYYY-MM-DD
      count: Number(item.count)
    }));
  }
} 
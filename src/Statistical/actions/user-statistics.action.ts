import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserStatisticsAction {
  constructor(private prisma: PrismaService) { }

  async execute() {
    const newUsers = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    const newUsersByDateRaw = await this.prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Gộp số người dùng mới theo ngày (YYYY-MM-DD)
    const newUsersByDate = Object.values(
      newUsersByDateRaw.reduce((acc, item) => {
        const date = item.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, count: 0 };
        }
        acc[date].count += item._count;
        return acc;
      }, {} as Record<string, { date: string; count: number }>)
    );

    const topCustomersByOrderCount = await this.prisma.user.findMany({
      where: {
        orders: {
          some: {},
        },
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        orders: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const topCustomersBySpending = await this.prisma.user.findMany({
      where: {
        orders: {
          some: {},
        },
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        orders: {
          select: {
            orderTotal: true,
          },
        },
      },
      take: 5,
    });

    const activeUsers = await this.prisma.user.findMany({
      where: {
        orders: {
          some: {},
        },
      },
    });

    return {
      totalNewUsers: newUsers.length,
      newUsersByDate,
      totalActiveUsers: activeUsers.length,
      topCustomersByOrderCount: topCustomersByOrderCount.map(user => ({
        id: user.id,
        email: user.email,
        phoneNumber: user?.phoneNumber,
        avatarUrl: user?.avatarUrl,
        orderCount: user._count.orders,
      })),
      topCustomersBySpending: topCustomersBySpending
        .map(user => ({
          id: user.id,
          email: user.email,
          phoneNumber: user?.phoneNumber,
          avatarUrl: user?.avatarUrl,
          totalSpending: user.orders.reduce((sum, order) => sum + order.orderTotal, 0),
        }))
        .sort((a, b) => b.totalSpending - a.totalSpending)
        .slice(0, 5),
    };
  }
}

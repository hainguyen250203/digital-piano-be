import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserStatisticsAction {
  constructor(private prisma: PrismaService) { }

  private formatDate(date: Date): string {
    const [year, month, day] = date.toISOString().split('T')[0].split('-');
    return `${day}-${month}-${year}`;
  }

  async execute() {
    // Lấy toàn bộ user để tính tổng người dùng mới
    const allNewUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Gộp số người dùng mới theo ngày (định dạng DD-MM-YYYY)
    const groupedNewUsersRaw = await this.prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: { createdAt: 'asc' },
    });

    const newUsersByDate = Object.values(
      groupedNewUsersRaw.reduce((acc, item) => {
        const date = this.formatDate(item.createdAt);
        if (!acc[date]) {
          acc[date] = { date, count: 0 };
        }
        acc[date].count += item._count;
        return acc;
      }, {} as Record<string, { date: string; count: number }>)
    );

    // Khách hàng có nhiều đơn hàng nhất
    const topCustomersByOrderCount = await this.prisma.user.findMany({
      where: {
        orders: { some: {} },
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        orders: { _count: 'desc' },
      },
      take: 5,
    });

    // Khách hàng chi tiêu nhiều nhất
    const topCustomersBySpendingRaw = await this.prisma.user.findMany({
      where: {
        orders: { some: {} },
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        orders: {
          select: { orderTotal: true },
        },
      },
    });

    const topCustomersBySpending = topCustomersBySpendingRaw
      .map(user => ({
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        totalSpending: user.orders.reduce((sum, order) => sum + order.orderTotal, 0),
      }))
      .sort((a, b) => b.totalSpending - a.totalSpending)
      .slice(0, 5);

    // Tổng số người dùng có đơn hàng (active)
    const activeUsers = await this.prisma.user.findMany({
      where: {
        orders: { some: {} },
      },
    });

    return {
      totalNewUsers: allNewUsers.length,
      newUsersByDate,
      totalActiveUsers: activeUsers.length,
      topCustomersByOrderCount: topCustomersByOrderCount.map(user => ({
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        orderCount: user._count.orders,
      })),
      topCustomersBySpending,
    };
  }
}

import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { CustomerStats, UserStats } from '../types/statistics.types';
import { groupByDate, sortByValue, takeTop } from '../utils/statistics.utils';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class UserStatisticsAction {
  private readonly TOP_CUSTOMERS_LIMIT = 5;

  constructor(private prisma: PrismaService) { }

  async execute(): Promise<UserStats> {
    const [allNewUsers, groupedNewUsersRaw, activeUsers, topCustomersByOrderCount, topCustomersBySpendingRaw] =
      await Promise.all([
        this.getAllNewUsers(),
        this.getGroupedNewUsers(),
        this.getActiveUsers(),
        this.getTopCustomersByOrderCount(),
        this.getTopCustomersBySpendingRaw(),
      ]);

    const newUsersByDate = groupByDate(groupedNewUsersRaw);
    const topCustomersBySpending = this.processTopCustomersBySpending(topCustomersBySpendingRaw);

    return {
      totalNewUsers: allNewUsers.length,
      newUsersByDate,
      totalActiveUsers: activeUsers.length,
      topCustomersByOrderCount: this.formatCustomerStats(topCustomersByOrderCount),
      topCustomersBySpending,
    };
  }

  private async getAllNewUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getGroupedNewUsers() {
    return this.prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getActiveUsers() {
    return this.prisma.user.findMany({
      where: {
        orders: { some: { orderStatus: OrderStatus.delivered } },
      },
    });
  }

  private async getTopCustomersByOrderCount(): Promise<CustomerStats[]> {
    const users = await this.prisma.user.findMany({
      where: {
        orders: { some: { orderStatus: OrderStatus.delivered } },
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        orders: {
          where: { orderStatus: OrderStatus.delivered },
        },
      },
      orderBy: {
        orders: { _count: 'desc' },
      },
      take: this.TOP_CUSTOMERS_LIMIT,
    });

    return this.formatCustomerStats(users);
  }

  private async getTopCustomersBySpendingRaw() {
    return this.prisma.user.findMany({
      where: {
        orders: { some: { orderStatus: OrderStatus.delivered } },
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        orders: {
          where: { orderStatus: OrderStatus.delivered },
          select: { orderTotal: true },
        },
      },
    });
  }

  private processTopCustomersBySpending(users: any[]): CustomerStats[] {
    const customersWithSpending = users.map(user => ({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      totalSpending: user.orders.reduce((sum: number, order: any) => sum + order.orderTotal, 0),
    }));

    return takeTop(
      sortByValue(customersWithSpending, 'totalSpending'),
      this.TOP_CUSTOMERS_LIMIT
    );
  }

  private formatCustomerStats(users: any[]): CustomerStats[] {
    return users.map(user => ({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      orderCount: user.orders?.length,
      totalSpending: user.orders?.reduce((sum: number, order: any) => sum + order.orderTotal, 0),
    }));
  }
}

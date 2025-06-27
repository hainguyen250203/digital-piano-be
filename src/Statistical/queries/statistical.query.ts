import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class StatisticalQuery {
  private readonly logger = new Logger(StatisticalQuery.name);

  constructor(private prisma: PrismaService) { }

  async getDashboardStatistics() {
    this.logger.log('Starting getDashboardStatistics...');

    // Get date information for period calculations
    const { today, todayISO, thisMonthISO } = this.getDateInfo();

    // Get revenue data from consistent source
    const revenueData = await this.getRevenueByDateAndMethod();

    // Calculate all revenue metrics from the same data source for consistency
    const {
      totalRevenue,
      todayRevenue,
      monthlyRevenue,
      yearlyRevenue
    } = this.calculateAllRevenuesFromConsistentSource(revenueData.revenueByDate, today);

    this.logger.log(`Calculated revenues from consistent source: total=${totalRevenue}, today=${todayRevenue}, month=${monthlyRevenue}, year=${yearlyRevenue}`);

    // Run other queries in parallel
    const [
      totalCounts,
      orderCountsByPeriod,
      lowStockProducts,
      orderStatusCounts,
    ] = await Promise.all([
      this.getTotalCounts(),
      this.getOrderCountsByPeriod(todayISO, today),
      this.getLowStockProducts(),
      this.getOrderStatusCounts(),
    ]);

    return {
      ...totalCounts,
      totalRevenue,
      ...orderCountsByPeriod,
      todayRevenue,
      monthlyRevenue,
      yearlyRevenue,
      lowStockProducts,
      orderStatusCounts,
    };
  }

  private getDateInfo() {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const thisMonthISO = today.toISOString().substring(0, 7); // YYYY-MM

    this.logger.log(`Today's date (ISO format): ${todayISO}`);
    this.logger.log(`This month (ISO format): ${thisMonthISO}`);

    return { today, todayISO, thisMonthISO };
  }

  private calculateAllRevenuesFromConsistentSource(revenueByDate: any[], today: Date): {
    totalRevenue: number;
    todayRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  } {
    const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const thisMonth = `${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const thisYear = today.getFullYear().toString();

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;
    let yearlyRevenue = 0;

    // Log a sample of the data we're working with
    if (revenueByDate.length > 0) {
      const sample = revenueByDate.slice(0, Math.min(3, revenueByDate.length));
      this.logger.log(`Sample revenue data format: ${JSON.stringify(sample)}`);
    }

    for (const dayData of revenueByDate) {
      const dayTotal = this.calculateDayTotal(dayData);
      totalRevenue += dayTotal;

      // Parse the date from 'DD-MM-YYYY' format
      if (!dayData.date) {
        this.logger.warn(`Missing date field in revenue data: ${JSON.stringify(dayData)}`);
        continue;
      }

      const [day, month, year] = dayData.date.split('-');

      // Calculate period-specific revenues
      if (dayData.date === todayStr) {
        todayRevenue += dayTotal;
      }

      if (`${month}-${year}` === thisMonth) {
        monthlyRevenue += dayTotal;
      }

      if (year === thisYear) {
        yearlyRevenue += dayTotal;
      }
    }

    return { totalRevenue, todayRevenue, monthlyRevenue, yearlyRevenue };
  }

  private calculateDayTotal(dayData: any): number {
    let dayTotal = 0;
    for (const key in dayData) {
      if (key !== 'date') {
        dayTotal += Number(dayData[key]);
      }
    }
    return dayTotal;
  }

  private async getTotalCounts() {
    const [totalOrders, totalUsers, totalProducts] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.user.count(),
      this.prisma.product.count(),
    ]);

    return { totalOrders, totalUsers, totalProducts };
  }

  private async getOrderCountsByPeriod(todayISO, today) {
    const [todayOrders, monthlyOrders, yearlyOrders] = await Promise.all([
      // Order counts by period
      this.prisma.order.count({
        where: { createdAt: { gte: new Date(todayISO) } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: new Date(today.getFullYear(), 0, 1) } },
      }),
    ]);

    return { todayOrders, monthlyOrders, yearlyOrders };
  }

  private async getLowStockProducts() {
    return this.prisma.stock.findMany({
      where: { quantity: { lte: 10 } },
      include: { product: true },
      take: 5,
    });
  }

  private async getOrderStatusCounts() {
    const [
      pending,
      processing,
      shipping,
      delivered,
      cancelled,
      returned,
    ] = await Promise.all([
      this.prisma.order.count({ where: { orderStatus: OrderStatus.pending } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.processing } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.shipping } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.delivered } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.cancelled } }),
      this.prisma.order.count({ where: { orderStatus: OrderStatus.returned } }),
    ]);

    return { pending, processing, shipping, delivered, cancelled, returned };
  }

  async getRevenueByDateAndMethod() {
    const revenueByDateAndMethodRaw = await this.fetchRevenueByDateAndMethod();
    return {
      revenueByDate: this.transformRevenueData(revenueByDateAndMethodRaw),
    };
  }

  private async fetchRevenueByDateAndMethod() {
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

  private transformRevenueData(revenueByDateAndMethodRaw) {
    return Object.values(
      revenueByDateAndMethodRaw.reduce((acc, item) => {
        const dateObj = item.createdAt;
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const date = `${day}-${month}-${year}`;

        if (!acc[date]) {
          acc[date] = { date };
        }
        acc[date][item.paymentMethod] = item._sum.orderTotal || 0;
        return acc;
      }, {} as Record<string, any>)
    );
  }
} 
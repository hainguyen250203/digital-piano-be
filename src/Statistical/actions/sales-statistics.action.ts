import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SalesStatisticsAction {
  constructor(private prisma: PrismaService) { }

  async execute() {
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['orderStatus'],
      _count: true,
    });

    const ordersByPaymentStatus = await this.prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: true,
    });

    const ordersByDateRaw = await this.prisma.order.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Gộp theo ngày YYYY-MM-DD
    const ordersByDate = Object.values(
      ordersByDateRaw.reduce((acc, item) => {
        const dateObj = item.createdAt;
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const date = `${day}-${month}-${year}`;
        
        if (!acc[date]) {
          acc[date] = { date, count: 0 };
        }
        acc[date].count += item._count;
        return acc;
      }, {} as Record<string, { date: string; count: number }>)
    );

    const totalOrders = ordersByDate.reduce((sum, item) => sum + item.count, 0);

    return {
      ordersByStatus: this.formatOrderStatusData(ordersByStatus),
      ordersByPaymentStatus: this.formatPaymentStatusData(ordersByPaymentStatus),
      ordersByDate,
      totalOrders,
    };
  }

  private formatOrderStatusData(data: any[]) {
    return data.map(item => ({
      status: item.orderStatus,
      count: item._count,
    }));
  }

  private formatPaymentStatusData(data: any[]) {
    return data.map(item => ({
      status: item.paymentStatus,
      count: item._count,
    }));
  }
}

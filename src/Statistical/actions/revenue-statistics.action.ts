import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class RevenueStatisticsAction {
  constructor(private prisma: PrismaService) { }

  async execute() {
    // Lấy các đơn hàng đã thanh toán
    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.paid,
        orderStatus: OrderStatus.delivered,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Nhóm doanh thu theo ngày và phương thức thanh toán
    const revenueByDateAndMethodRaw = await this.prisma.order.groupBy({
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

    // Gộp theo ngày, mỗi ngày là một object chứa các phương thức thanh toán
    const revenueByDate = Object.values(
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

    // Calculate the total revenue from all payment methods across all dates
    const totalRevenue = this.calculateTotalFromRevenueByDate(revenueByDate);

    return {
      revenueByDate,
      totalRevenue,
    };
  }

  // Calculate total revenue from revenueByDate array
  private calculateTotalFromRevenueByDate(revenueByDate: any[]): number {
    let total = 0;
    for (const dayData of revenueByDate) {
      // Skip the date key
      for (const key in dayData) {
        if (key !== 'date') {
          total += Number(dayData[key]);
        }
      }
    }
    return total;
  }
}

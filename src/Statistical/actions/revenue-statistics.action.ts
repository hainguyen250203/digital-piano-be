import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RevenueStatisticsAction {
  constructor(private prisma: PrismaService) { }

  async execute() {
    // Lấy các đơn hàng đã thanh toán
    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: 'paid',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Nhóm doanh thu theo ngày và phương thức thanh toán
    const revenueByDateAndMethodRaw = await this.prisma.order.groupBy({
      by: ['createdAt', 'paymentMethod'],
      where: {
        paymentStatus: 'paid',
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

    return {
      revenueByDate,
    };
  }
}

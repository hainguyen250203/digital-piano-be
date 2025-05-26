import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class StatisticalQuery {
  constructor(private prisma: PrismaService) {}

  async getDashboardStatistics() {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      todayOrders,
      todayRevenue,
      monthlyOrders,
      monthlyRevenue,
      yearlyOrders,
      yearlyRevenue,
      lowStockProducts,
      pendingOrders,
      processingOrders,
      shippingOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
    ] = await Promise.all([
      // Total counts
      this.prisma.order.count(),
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.getTotalRevenue(),
      
      // Today stats
      this.prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.getRevenue({ startDate: startOfToday }),
      
      // Monthly stats
      this.prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.getRevenue({ startDate: startOfMonth }),
      
      // Yearly stats
      this.prisma.order.count({
        where: { createdAt: { gte: startOfYear } },
      }),
      this.getRevenue({ startDate: startOfYear }),
      
      // Low stock products
      this.prisma.stock.findMany({
        where: { quantity: { lte: 10 } },
        include: { product: true },
        take: 5,
      }),
      
      // Order status counts
      this.prisma.order.count({
        where: { orderStatus: OrderStatus.pending },
      }),
      this.prisma.order.count({
        where: { orderStatus: OrderStatus.processing },
      }),
      this.prisma.order.count({
        where: { orderStatus: OrderStatus.shipping },
      }),
      this.prisma.order.count({
        where: { orderStatus: OrderStatus.delivered },
      }),
      this.prisma.order.count({
        where: { orderStatus: OrderStatus.cancelled },
      }),
      this.prisma.order.count({
        where: { orderStatus: OrderStatus.returned },
      }),
    ]);

    return {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      todayOrders,
      todayRevenue,
      monthlyOrders,
      monthlyRevenue,
      yearlyOrders,
      yearlyRevenue,
      lowStockProducts,
      orderStatusCounts: {
        pending: pendingOrders,
        processing: processingOrders,
        shipping: shippingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        returned: returnedOrders,
      },
    };
  }

  private async getTotalRevenue() {
    const result = await this.prisma.order.aggregate({
      where: {
        paymentStatus: PaymentStatus.paid,
      },
      _sum: {
        orderTotal: true,
      },
    });
    
    return Number(result._sum.orderTotal || 0);
  }

  private async getRevenue({ startDate, endDate }: { startDate?: Date; endDate?: Date }) {
    const where: any = {
      paymentStatus: PaymentStatus.paid,
    };

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: startDate };
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    const result = await this.prisma.order.aggregate({
      where,
      _sum: {
        orderTotal: true,
      },
    });
    
    return Number(result._sum.orderTotal || 0);
  }
} 
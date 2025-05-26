import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { TimePeriod } from '../api/dto/get-sales-statistics.dto';
import { GetProductStatisticsParams } from '../queries/params/get-statistics.params';

@Injectable()
export class ProductStatisticsAction {
  constructor(private prisma: PrismaService) {}

  async execute(params: GetProductStatisticsParams) {
    const { startDate, endDate, period } = params;
    const timeRange = this.getTimeRange(startDate, endDate, period);

    const productData = await this.getProductData(
      timeRange.startDate, 
      timeRange.endDate
    );
    
    return {
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
      period: period || 'custom',
      data: productData,
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

  private async getProductData(startDate: Date, endDate: Date) {
    // Best selling products
    const bestSellingProducts = await this.getBestSellingProducts(startDate, endDate);
    
    // Sales by category
    const salesByCategory = await this.getSalesByCategory(startDate, endDate);
    
    // Sales by subcategory
    const salesBySubCategory = await this.getSalesBySubCategory(startDate, endDate);
    
    // Products with highest revenue
    const highestRevenueProducts = await this.getHighestRevenueProducts(startDate, endDate);
    
    return {
      bestSellingProducts,
      salesByCategory,
      salesBySubCategory,
      highestRevenueProducts,
    };
  }

  private async getBestSellingProducts(
    startDate: Date, 
    endDate: Date, 
    limit = 10
  ) {
    // First, filter orders by completed status and date range
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          orderStatus: {
            in: [OrderStatus.delivered],
          },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            subCategory: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group by product and calculate total quantity
    const productSales: Record<string, { 
      product: any, 
      totalQuantity: number,
      totalRevenue: number 
    }> = {};

    orderItems.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          product: item.product,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      
      productSales[item.productId].totalQuantity += item.quantity;
      productSales[item.productId].totalRevenue += item.price * item.quantity;
    });

    // Convert to array and sort by total quantity
    return Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  private async getHighestRevenueProducts(
    startDate: Date, 
    endDate: Date, 
    limit = 10
  ) {
    // Reuse the same logic as getBestSellingProducts but sort by revenue instead
    const productSales = await this.getBestSellingProducts(startDate, endDate, 100);
    
    return productSales
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  private async getSalesByCategory(startDate: Date, endDate: Date) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          orderStatus: {
            in: [OrderStatus.delivered],
          },
        },
      },
      include: {
        product: {
          select: {
            subCategory: {
              select: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group by category and calculate totals
    const categorySales: Record<string, { 
      categoryId: string,
      categoryName: string,
      totalQuantity: number,
      totalRevenue: number 
    }> = {};

    orderItems.forEach(item => {
      const categoryId = item.product.subCategory.category.id;
      const categoryName = item.product.subCategory.category.name;
      
      if (!categorySales[categoryId]) {
        categorySales[categoryId] = {
          categoryId,
          categoryName,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      
      categorySales[categoryId].totalQuantity += item.quantity;
      categorySales[categoryId].totalRevenue += item.price * item.quantity;
    });

    return Object.values(categorySales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  private async getSalesBySubCategory(startDate: Date, endDate: Date) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          orderStatus: {
            in: [OrderStatus.delivered],
          },
        },
      },
      include: {
        product: {
          select: {
            subCategory: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group by subcategory and calculate totals
    const subCategorySales: Record<string, { 
      subCategoryId: string,
      subCategoryName: string,
      categoryId: string,
      categoryName: string,
      totalQuantity: number,
      totalRevenue: number 
    }> = {};

    orderItems.forEach(item => {
      const subCategory = item.product.subCategory;
      
      if (!subCategorySales[subCategory.id]) {
        subCategorySales[subCategory.id] = {
          subCategoryId: subCategory.id,
          subCategoryName: subCategory.name,
          categoryId: subCategory.category.id,
          categoryName: subCategory.category.name,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      
      subCategorySales[subCategory.id].totalQuantity += item.quantity;
      subCategorySales[subCategory.id].totalRevenue += item.price * item.quantity;
    });

    return Object.values(subCategorySales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
} 
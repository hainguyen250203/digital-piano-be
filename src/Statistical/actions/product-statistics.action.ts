import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductStatisticsAction {
  constructor(private prisma: PrismaService) { }

  async execute() {
    // Get best selling products
    const bestSellingProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for best sellers
    const bestSellingProductDetails = await this.prisma.product.findMany({
      where: {
        id: {
          in: bestSellingProducts.map(p => p.productId),
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    // Get sales by category
    const salesByCategoryRaw = await this.prisma.$queryRaw`
      SELECT 
        c.id as "categoryId",
        c.name as "categoryName",
        SUM(oi.quantity) as "totalQuantity",
        SUM(oi.price) as "totalRevenue"
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "SubCategory" sc ON p."subCategoryId" = sc.id
      JOIN "Category" c ON sc."categoryId" = c.id
      GROUP BY c.id, c.name
      ORDER BY "totalQuantity" DESC
    `;

    // Convert BigInt to Number
    const salesByCategory = this.convertBigIntsToNumbers(salesByCategoryRaw);

    // Get sales by subcategory
    const salesBySubCategoryRaw = await this.prisma.$queryRaw`
      SELECT 
        sc.id as "subCategoryId",
        sc.name as "subCategoryName",
        c.id as "categoryId",
        c.name as "categoryName",
        SUM(oi.quantity) as "totalQuantity",
        SUM(oi.price) as "totalRevenue"
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "SubCategory" sc ON p."subCategoryId" = sc.id
      JOIN "Category" c ON sc."categoryId" = c.id
      GROUP BY sc.id, sc.name, c.id, c.name
      ORDER BY "totalQuantity" DESC
    `;

    // Convert BigInt to Number
    const salesBySubCategory = this.convertBigIntsToNumbers(salesBySubCategoryRaw);

    // Get highest revenue products
    const highestRevenueProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        price: true,
        quantity: true,
      },
      orderBy: {
        _sum: {
          price: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for highest revenue
    const highestRevenueProductDetails = await this.prisma.product.findMany({
      where: {
        id: {
          in: highestRevenueProducts.map(p => p.productId),
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    return {
      bestSellingProducts: bestSellingProducts.map(item => {
        const product = bestSellingProductDetails.find(p => p.id === item.productId);
        return {
          product: {
            id: product?.id || '',
            name: product?.name || '',
            price: product?.price || 0,
          },
          totalQuantity: item._sum?.quantity || 0,
          totalRevenue: (item._sum?.quantity || 0) * Number(product?.price || 0),
        };
      }),
      salesByCategory: salesByCategory,
      salesBySubCategory: salesBySubCategory,
      highestRevenueProducts: highestRevenueProducts.map(item => {
        const product = highestRevenueProductDetails.find(p => p.id === item.productId);
        return {
          product: {
            id: product?.id || '',
            name: product?.name || '',
            price: product?.price || 0,
          },
          totalQuantity: item._sum?.quantity || 0,
          totalRevenue: item._sum?.price || 0,
        };
      }),
    };
  }

  /**
   * Convert BigInt values to regular numbers in an object or array
   */
  private convertBigIntsToNumbers(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'bigint') {
      // Convert BigInt to number
      return Number(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.convertBigIntsToNumbers(item));
    }

    if (typeof data === 'object') {
      const result = {};
      for (const key in data) {
        result[key] = this.convertBigIntsToNumbers(data[key]);
      }
      return result;
    }

    return data;
  }
}
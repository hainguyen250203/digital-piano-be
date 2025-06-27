import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ChangeType } from '@prisma/client';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { ImportValueStats, ProductStats, StockMovementStats, StockStats } from '../types/statistics.types';
import { formatDateTime, takeTop } from '../utils/statistics.utils';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class StockStatisticsAction {
  private readonly LOW_STOCK_THRESHOLD = 10;
  private readonly TOP_PRODUCTS_LIMIT = 10;
  private readonly RECENT_INVOICES_LIMIT = 5;

  constructor(private prisma: PrismaService) { }

  async execute(): Promise<StockStats> {
    const [
      stockLevels,
      stockMovement,
      outOfStockProducts,
      lowStockProducts,
      importValueData
    ] = await Promise.all([
      this.getStockLevels(),
      this.getStockMovement(),
      this.getOutOfStockProducts(),
      this.getLowStockProducts(),
      this.getImportValueData()
    ]);

    return {
      stockLevels,
      stockMovement,
      outOfStockProducts,
      lowStockProducts,
      importValueData,
      stockSummary: {
        outOfStockCount: outOfStockProducts.length,
        lowStockCount: lowStockProducts.length,
      },
    };
  }

  private async getStockLevels() {
    const stocks = await this.prisma.stock.findMany({
      where: {
        product: {
          isDeleted: false,
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
      orderBy: {
        quantity: 'asc',
      },
    });

    return stocks.map(stock => ({
      stockId: stock.id,
      productId: stock.productId,
      productName: stock.product.name,
      quantity: stock.quantity,
      subCategoryId: stock.product.subCategory.id,
      subCategoryName: stock.product.subCategory.name,
      categoryId: stock.product.subCategory.category.id,
      categoryName: stock.product.subCategory.category.name,
    }));
  }

  private async getOutOfStockProducts() {
    return this.prisma.stock.findMany({
      where: {
        quantity: 0,
        product: {
          isDeleted: false,
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
  }

  private async getLowStockProducts() {
    return this.prisma.stock.findMany({
      where: {
        quantity: {
          gt: 0,
          lte: this.LOW_STOCK_THRESHOLD,
        },
        product: {
          isDeleted: false,
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
      orderBy: {
        quantity: 'asc',
      },
    });
  }

  private async getStockMovement(): Promise<StockMovementStats> {
    const [stockLogs, changeTypeStats] = await Promise.all([
      this.getStockLogs(),
      this.getChangeTypeStats()
    ]);

    const summary = this.calculateChangeTypeSummary(changeTypeStats);

    return {
      recentChanges: stockLogs.map(log => ({
        id: log.id,
        productId: log.stock.productId,
        productName: log.stock.product.name,
        changeType: log.changeType,
        change: Number(log.change),
        createdAt: formatDateTime(log.createdAt),
        referenceType: log.referenceType,
        referenceId: log.referenceId,
        note: log.note,
      })),
      changeTypeSummary: summary,
    };
  }

  private async getStockLogs() {
    return this.prisma.stockLog.findMany({
      where: {
        stock: {
          product: {
            isDeleted: false,
          },
        },
      },
      include: {
        stock: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async getChangeTypeStats() {
    return this.prisma.stockLog.groupBy({
      by: ['changeType'],
      where: {
        stock: {
          product: {
            isDeleted: false,
          },
        },
      },
      _sum: {
        change: true,
      },
    });
  }

  private calculateChangeTypeSummary(changeTypeStats: any[]) {
    return {
      import: Number(changeTypeStats.find(stat => stat.changeType === ChangeType.import)?._sum.change || 0),
      sale: Number(changeTypeStats.find(stat => stat.changeType === ChangeType.sale)?._sum.change || 0),
      return: Number(changeTypeStats.find(stat => stat.changeType === ChangeType.return)?._sum.change || 0),
      cancel: Number(changeTypeStats.find(stat => stat.changeType === ChangeType.cancel)?._sum.change || 0),
      adjustment: Number(changeTypeStats.find(stat => stat.changeType === ChangeType.adjustment)?._sum.change || 0),
    };
  }

  private async getImportValueData(): Promise<ImportValueStats> {
    const [
      totalImportValue,
      totalImportQuantity,
      totalSalesQuantity,
      totalReturnsQuantity,
      recentInvoices,
      topProductsByImportValue
    ] = await Promise.all([
      this.getTotalImportValue(),
      this.getTotalImportQuantity(),
      this.getTotalSalesQuantity(),
      this.getTotalReturnsQuantity(),
      this.getRecentInvoices(),
      this.getTopProductsByImportValue()
    ]);

    return {
      totalImportValue,
      totalImportQuantity,
      totalSalesQuantity,
      totalReturnsQuantity,
      recentInvoices,
      topProductsByImportValue,
    };
  }

  private async getTotalImportValue() {
    const result = await this.prisma.invoice.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        isDeleted: false,
      },
    });

    return Number(result._sum.totalAmount || 0);
  }

  private async getTotalImportQuantity() {
    const result = await this.prisma.invoiceItem.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        invoice: {
          isDeleted: false,
        },
      },
    });

    return Number(result._sum.quantity || 0);
  }

  private async getTotalSalesQuantity() {
    const result = await this.prisma.orderItem.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          orderStatus: {
            in: ['delivered', 'shipping'],
          },
          paymentStatus: 'paid',
        },
      },
    });

    return Number(result._sum.quantity || 0);
  }

  private async getTotalReturnsQuantity(): Promise<number> {
    const result = await this.prisma.productReturn.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _sum: {
        quantity: true,
      },
    });

    return result._sum.quantity || 0;
  }

  private async getRecentInvoices() {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: this.RECENT_INVOICES_LIMIT,
    });

    return invoices.map(invoice => ({
      id: invoice.id,
      supplierId: invoice.supplierId,
      supplierName: invoice.supplier.name,
      totalAmount: Number(invoice.totalAmount),
      createdAt: formatDateTime(invoice.createdAt),
    }));
  }

  private async getTopProductsByImportValue(): Promise<ProductStats[]> {
    const [result, products] = await Promise.all([
      this.getProductImportStats(),
      this.getProductsInfo()
    ]);

    return this.formatProductImportStats(result, products);
  }

  private async getProductImportStats() {
    return this.prisma.invoiceItem.groupBy({
      by: ['productId'],
      where: {
        invoice: {
          isDeleted: false,
        },
      },
      _sum: {
        subtotal: true,
        quantity: true,
      },
      orderBy: {
        _sum: {
          subtotal: 'desc',
        },
      },
    });
  }

  private async getProductsInfo() {
    const result = await this.getProductImportStats();
    const productIds = result.map(item => item.productId);

    return this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  private formatProductImportStats(stats: any[], products: any[]): ProductStats[] {
    return takeTop(
      stats.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          quantity: Number(item._sum.quantity || 0),
          value: Number(item._sum.subtotal || 0),
          averagePrice: item._sum.quantity
            ? Math.round(Number(item._sum.subtotal) / Number(item._sum.quantity))
            : 0,
        };
      }),
      this.TOP_PRODUCTS_LIMIT
    );
  }

  async getReturnedProductsCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.productReturn.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        _all: true,
      },
    });

    return result._count._all || 0;
  }
} 
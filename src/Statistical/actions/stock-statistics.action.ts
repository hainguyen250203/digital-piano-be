import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ChangeType } from '@prisma/client';
import { StockSortType } from '../api/dto/get-stock-statistics.dto';
import { GetStockStatisticsParams } from '../queries/params/get-statistics.params';

@Injectable()
export class StockStatisticsAction {
  constructor(private prisma: PrismaService) {}

  async execute(params: GetStockStatisticsParams) {
    const { sortBy } = params;

    const stockData = await this.getStockData(sortBy);
    
    return {
      sortBy: sortBy || StockSortType.LOW_STOCK,
      data: stockData,
    };
  }

  private async getStockData(sortBy?: StockSortType) {
    // Get stock levels for products
    const stockLevels = await this.getStockLevels(sortBy);
    
    // Get stock movement (changes over time)
    const stockMovement = await this.getStockMovement();
    
    // Get out of stock products
    const outOfStockProducts = await this.getOutOfStockProducts();
    
    // Get low stock products
    const lowStockProducts = await this.getLowStockProducts();
    
    // Get import value information
    const importValueData = await this.getImportValueData();
    
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

  private async getStockLevels(
    sortBy?: StockSortType,
    limit = 10
  ) {
    let orderBy: any = {};
    
    switch (sortBy) {
      case StockSortType.LOW_STOCK:
        orderBy = { quantity: 'asc' };
        break;
      case StockSortType.HIGH_STOCK:
        orderBy = { quantity: 'desc' };
        break;
      case StockSortType.MOST_CHANGED:
        // This requires more complex logic with StockLog
        // Default to low stock for now
        orderBy = { quantity: 'asc' };
        break;
      default:
        orderBy = { quantity: 'asc' };
    }

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
      orderBy,
      take: limit,
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

  private async getOutOfStockProducts(limit = 10) {
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
      take: limit,
    });
  }

  private async getLowStockProducts(threshold = 10, limit = 10) {
    return this.prisma.stock.findMany({
      where: {
        quantity: {
          gt: 0,
          lte: threshold,
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
      take: limit,
    });
  }

  private async getStockMovement(limit = 10) {
    // Get the most recent stock changes
    const stockLogs = await this.prisma.stockLog.findMany({
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
      take: limit,
    });

    // Group by change type and calculate totals
    const changeTypeStats = await this.prisma.stockLog.groupBy({
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

    const importCount = Number(changeTypeStats.find(stat => stat.changeType === ChangeType.import)?._sum.change || 0);
    const saleCount = Number(changeTypeStats.find(stat => stat.changeType === ChangeType.sale)?._sum.change || 0);
    const returnCount = Number(changeTypeStats.find(stat => stat.changeType === ChangeType.return)?._sum.change || 0);
    const cancelCount = Number(changeTypeStats.find(stat => stat.changeType === ChangeType.cancel)?._sum.change || 0);
    const adjustmentCount = Number(changeTypeStats.find(stat => stat.changeType === ChangeType.adjustment)?._sum.change || 0);

    return {
      recentChanges: stockLogs.map(log => ({
        id: log.id,
        productId: log.stock.productId,
        productName: log.stock.product.name,
        changeType: log.changeType,
        change: Number(log.change),
        createdAt: log.createdAt,
        referenceType: log.referenceType,
        referenceId: log.referenceId,
        note: log.note,
      })),
      changeTypeSummary: {
        import: importCount,
        sale: saleCount,
        return: returnCount,
        cancel: cancelCount,
        adjustment: adjustmentCount,
      },
    };
  }

  private async getImportValueData() {
    // Get total import value from invoices
    const totalImportValue = await this.getTotalImportValue();
    
    // Get total import quantity
    const totalImportQuantity = await this.getTotalImportQuantity();
    
    // Get total sales quantity
    const totalSalesQuantity = await this.getTotalSalesQuantity();
    
    // Get total returns quantity
    const totalReturnsQuantity = await this.getTotalReturnsQuantity();
    
    // Get recent invoices with their values
    const recentInvoices = await this.getRecentInvoices();
    
    // Get top products by import value
    const topProductsByImportValue = await this.getTopProductsByImportValue();
    
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
    // Sum the total quantity of all imported products
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

  private async getTotalReturnsQuantity() {
    const result = await this.prisma.productReturn.aggregate({
      _count: {
        id: true,
      },
      where: {
        productReturnStatus: 'completed',
      },
    });
    
    return Number(result._count.id || 0);
  }

  private async getRecentInvoices(limit = 5) {
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
      take: limit,
    });
    
    return invoices.map(invoice => ({
      id: invoice.id,
      supplierId: invoice.supplierId,
      supplierName: invoice.supplier.name,
      totalAmount: Number(invoice.totalAmount),
      createdAt: invoice.createdAt,
    }));
  }

  private async getTopProductsByImportValue(limit = 10) {
    const result = await this.prisma.invoiceItem.groupBy({
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
      take: limit,
    });
    
    // Get product information for these items
    const productIds = result.map(item => item.productId);
    const products = await this.prisma.product.findMany({
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
    
    return result.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || 'Unknown Product',
        totalImportValue: Number(item._sum.subtotal || 0),
        totalQuantity: Number(item._sum.quantity || 0),
        averageImportPrice: item._sum.quantity 
          ? Math.round(Number(item._sum.subtotal) / Number(item._sum.quantity)) 
          : 0,
      };
    });
  }
} 
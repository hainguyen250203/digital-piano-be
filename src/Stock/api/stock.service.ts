import { PrismaService } from '@/Prisma/prisma.service';
import { CreateStockAction } from '@/Stock/actions/create-stock.action';
import { UpdateStockAction } from '@/Stock/actions/update-stock.action';
import { GetStockQuery } from '@/Stock/queries/stock.query';
import { Injectable } from '@nestjs/common';
import { ChangeType, ReferenceType } from '@prisma/client';


@Injectable()
export class StockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createStockAction: CreateStockAction,
    private readonly updateStockAction: UpdateStockAction,
    private readonly getStockQuery: GetStockQuery,
  ) { }

  async createStock(productId: string, quantity: number) {
    return this.createStockAction.execute({ productId, quantity });
  }

  async updateStock(
    productId: string,
    change: number,
    changeType: ChangeType,
    referenceType: ReferenceType,
    referenceId?: string,
    note?: string,
  ) {
    return this.updateStockAction.execute({
      productId,
      change,
      changeType,
      referenceType,
      referenceId,
      note,
    });
  }

  async getStock(productId: string) {
    return this.getStockQuery.execute(productId);
  }

  async deductStockForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    for (const item of order.items) {
      await this.updateStock(
        item.productId,
        -item.quantity,
        ChangeType.sale,
        ReferenceType.order,
        orderId,
        `Stock deducted for order ${orderId}`,
      );
    }
  }
} 
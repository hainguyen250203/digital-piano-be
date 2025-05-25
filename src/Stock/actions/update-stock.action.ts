import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ChangeType, ReferenceType } from '@prisma/client';

interface UpdateStockParams {
  productId: string;
  change: number;
  changeType: ChangeType;
  referenceType: ReferenceType;
  referenceId?: string;
  note?: string;
}

@Injectable()
export class UpdateStockAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: UpdateStockParams) {
    const { productId, change, changeType, referenceType, referenceId, note } = params;

    const stock = await this.prisma.stock.findUnique({
      where: { productId },
    });

    if (!stock) {
      throw new Error('Stock not found for this product');
    }

    const newQuantity = stock.quantity + change;

    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    const [updatedStock] = await this.prisma.$transaction([
      this.prisma.stock.update({
        where: { productId },
        data: { quantity: newQuantity },
      }),
      this.prisma.stockLog.create({
        data: {
          stockId: stock.id,
          change,
          changeType,
          referenceType,
          referenceId,
          note,
        },
      }),
    ]);

    return updatedStock;
  }
} 
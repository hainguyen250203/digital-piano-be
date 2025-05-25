import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';

interface CreateStockParams {
  productId: string;
  quantity: number;
}

@Injectable()
export class CreateStockAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: CreateStockParams) {
    const { productId, quantity } = params;

    const existingStock = await this.prisma.stock.findUnique({
      where: { productId },
    });

    if (existingStock) {
      throw new Error('Stock already exists for this product');
    }

    return this.prisma.stock.create({
      data: {
        productId,
        quantity,
      },
    });
  }
} 
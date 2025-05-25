import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetStockQuery {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string) {
    const stock = await this.prisma.stock.findUnique({
      where: { productId },
      include: {
        product: {
          select: {
            name: true,
            price: true,
          },
        },
        logs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!stock) {
      throw new Error('Stock not found for this product');
    }

    return stock;
  }
} 
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';

@Injectable()
export class GetUserProductReturnsAction {
  constructor(private prisma: PrismaService) { }

  async execute(userId: string) {
    return this.prisma.productReturn.findMany({
      where: { order: { userId: userId } },
      include: {
        orderItem: { include: { product: { select: { name: true, defaultImage: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
} 
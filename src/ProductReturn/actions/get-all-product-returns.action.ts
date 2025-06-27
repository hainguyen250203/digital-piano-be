import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';

@Injectable()
export class GetAllProductReturnsAction {
  constructor(private prisma: PrismaService) { }

  async execute() {
    return this.prisma.productReturn.findMany({
      include: {
        orderItem: { include: { product: { select: { name: true, defaultImage: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
} 
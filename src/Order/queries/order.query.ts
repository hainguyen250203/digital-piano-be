import { UpdateOrderParams } from "@/Order/actions/update-order.params";
import { CreateOrderParams } from "@/Order/queries/params/create-order.params";
import { PrismaService } from "@/Prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Order, PaymentStatus } from "@prisma/client";

@Injectable()
export class OrderQuery {
  constructor(private readonly prisma: PrismaService) { }

  async createOrder(params: CreateOrderParams) {
    return this.prisma.order.create({
      data: {
        ...params,
        items: {
          create: params.items
        }
      }
    });
  }

  async getOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                defaultImage: true,
              }
            }
          }
        },
        address: true,
        discount: true,
        user: true,
      }
    });
  }

  async updateOrder(params: UpdateOrderParams) {
    return this.prisma.order.update({
      where: { id: params.id },
      data: params
    });
  }

  async updateOrderIfUnpaid(params: UpdateOrderParams): Promise<Order | null> {
    // update với điều kiện
    const result = await this.prisma.order.updateMany({
      where: {
        id: params.id,
        paymentStatus: PaymentStatus.unpaid,
      },
      data: {
        paymentStatus: params.paymentStatus,
        paidAt: params.paidAt,
        transactionId: params.transactionId,
      },
    });

    if (result.count === 1) {
      // Nếu update thành công, lấy lại order đã cập nhật
      return this.getOrderById(params.id);
    }
    // Nếu không update được (đã update rồi), trả về null
    return null;
  }

  async getOrdersByUserId(userId: string) {
    return this.prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        address: true,
        discount: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }


}


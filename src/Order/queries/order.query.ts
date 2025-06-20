import { UpdateOrderParams } from '@/Order/actions/update-order.params';
import { CreateOrderParams } from '@/Order/queries/params/create-order.params';
import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Order, OrderStatus, PaymentStatus } from '@prisma/client';

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
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                defaultImage: true,
                reviews: true,
              }
            },
            productReturns: {
              select: {
                id: true,
                status: true,
                quantity: true,
                createdAt: true,
                orderItem: {
                  select: {
                    product: {
                      select: {
                        id: true,
                        name: true,
                        defaultImage: true,
                      }
                    }
                  }
                }
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

  async getOrderDetailByUserId(orderId: string, userId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                defaultImage: true,
                reviews: {
                  where: {
                    userId: userId,
                  }
                }
              }
            },
            productReturns: {
              select: {
                id: true,
                status: true,
                quantity: true,
                createdAt: true,
                orderItem: {
                  select: {
                    id: true,
                    product: {
                      select: {
                        id: true,
                        name: true,
                        defaultImage: true,
                      }
                    }
                  }
                }
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
    return this.prisma.order.findMany({
      where: {
        userId
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                defaultImage: true,
                price: true,
                salePrice: true,
              }
            },
            productReturns: {
              where: {
                status: {
                  in: ['PENDING', 'APPROVED', 'COMPLETED']
                }
              },
              select: {
                id: true,
                status: true,
                quantity: true,
                createdAt: true,
              }
            }
          }
        },
        address: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            street: true,
            ward: true,
            district: true,
            city: true,
          }
        },
        discount: {
          select: {
            id: true,
            code: true,
            discountType: true,
            value: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
          }
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { updatedAt: 'desc' }
      ],
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                defaultImage: true,
                price: true,
                salePrice: true,
              }
            },
            productReturns: {
              where: {
                status: {
                  in: ['PENDING', 'APPROVED', 'COMPLETED']
                }
              },
              select: {
                id: true,
                status: true,
                quantity: true,
                createdAt: true,
              }
            }
          }
        },
        address: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            street: true,
            ward: true,
            district: true,
            city: true,
          }
        },
        discount: {
          select: {
            id: true,
            code: true,
            discountType: true,
            value: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
          }
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { updatedAt: 'desc' }
      ],
    });
  }

  async getOrdersByStatus(status: OrderStatus) {
    return this.prisma.order.findMany({
      where: {
        orderStatus: status
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                defaultImage: true,
                price: true,
                salePrice: true,
              }
            },
            productReturns: {
              where: {
                status: {
                  in: ['PENDING', 'APPROVED', 'COMPLETED']
                }
              },
              select: {
                id: true,
                status: true,
                quantity: true,
                createdAt: true,
              }
            }
          }
        },
        address: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            street: true,
            ward: true,
            district: true,
            city: true,
          }
        },
        discount: {
          select: {
            id: true,
            code: true,
            discountType: true,
            value: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
          }
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { updatedAt: 'desc' }
      ],
    });
  }


}


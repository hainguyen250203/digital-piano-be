import { AddressQuery } from '@/Address/queries/address.query';
import { CartQuery } from '@/Cart/queries/cart.query';
import { DiscountQuery } from '@/Discount/queries/discount.query';
import { NotificationService } from '@/notification/domain/notification.service';
import { OrderQuery } from '@/Order/queries/order.query';
import {
    CreateOrderItem,
    CreateOrderParams,
} from '@/Order/queries/params/create-order.params';
import { PaymentQuery } from '@/Payment/queries/payment.query';
import { PrismaService } from '@/Prisma/prisma.service';
import { StockService } from '@/Stock/api/stock.service';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import {
    ChangeType,
    Discount,
    DiscountType,
    NotificationType,
    PaymentMethod,
    ReferenceType,
} from '@prisma/client';
import { ReqCreateOrderDto } from '../api/dto/reqCreateOrder.dto';

interface OrderCalculationResult {
  orderItems: CreateOrderItem[];
  orderTotal: number;
  discountId?: string;
  finalTotal: number;
  discountAmount: number;
}

@Injectable()
export class CreateOrderAction {
  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly discountQuery: DiscountQuery,
    private readonly addressQuery: AddressQuery,
    private readonly cartQuery: CartQuery,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly paymentQuery: PaymentQuery,
    private readonly stockService: StockService,
  ) { }

  async execute(userId: string, ipAddr: string, dto: ReqCreateOrderDto) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
    try {
      await this.validateAddress(userId, dto.addressId);
          const orderData = await this.prepareOrderData(userId, dto.discountCode);
          const order = await this.createOrder(userId, dto, orderData);
          await this.handlePostOrderOperations(order, orderData, dto, ipAddr);
          return await this.formatOrderResponse(order, dto.paymentMethod, ipAddr);
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private async prepareOrderData(
    userId: string,
    discountCode?: string,
  ): Promise<OrderCalculationResult> {
    const { orderItems, orderTotal } = await this.prepareOrderItems(userId);
    const discountResult = await this.calculateDiscount(discountCode, orderTotal);

    return {
      orderItems,
      orderTotal,
      ...discountResult,
    };
  }

  private async validateAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.addressQuery.findById(addressId);
    if (!address || address.userId !== userId) {
      throw new BadRequestException('Địa chỉ không hợp lệ');
    }
  }

  private async prepareOrderItems(userId: string): Promise<{
    orderItems: CreateOrderItem[];
    orderTotal: number;
  }> {
    const cart = await this.cartQuery.getCart(userId);
    if (!cart?.items.length) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    const orderItems: CreateOrderItem[] = [];
    let orderTotal = 0;

    const productIds = cart.items.map((item) => item.product.id);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of cart.items) {
      const product = productMap.get(item.product.id);
      if (!product) {
        throw new BadRequestException(`Sản phẩm ${item.product.id} không tồn tại`);
      }

      const price = product.salePrice || product.price;
      orderTotal += price * item.quantity;

      orderItems.push({
        productId: item.product.id,
        price,
        quantity: item.quantity,
      });
    }

    return { orderItems, orderTotal };
  }

  private async calculateDiscount(
    discountCode: string | undefined,
    orderTotal: number,
  ): Promise<{
    discountId: string | undefined;
    finalTotal: number;
    discountAmount: number;
  }> {
    if (!discountCode) {
      return { discountId: undefined, finalTotal: orderTotal, discountAmount: 0 };
    }

    const discount = await this.validateAndGetDiscount(discountCode, orderTotal);
    const discountAmount = this.calculateDiscountAmount(discount, orderTotal);

    return {
      discountId: discount.id,
      finalTotal: orderTotal - discountAmount,
      discountAmount,
    };
  }

  private async validateAndGetDiscount(
    discountCode: string,
    orderTotal: number,
  ): Promise<Discount> {
    const now = new Date();
    const discount = await this.discountQuery.getDiscountByCode(discountCode);

    if (!discount?.isActive) {
      throw new BadRequestException('Mã giảm giá không hoạt động');
    }

    if (discount.startDate && discount.startDate > now) {
      throw new BadRequestException('Mã giảm giá chưa bắt đầu');
    }

    if (discount.endDate && discount.endDate < now) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      throw new BadRequestException('Mã giảm giá đã được sử dụng hết lượt');
    }

    if (discount.minOrderTotal && orderTotal < discount.minOrderTotal) {
      throw new BadRequestException(
        `Tổng đơn hàng phải tối thiểu ${discount.minOrderTotal.toLocaleString('vi-VN')}đ`,
      );
    }

    return discount;
  }

  private calculateDiscountAmount(discount: Discount, orderTotal: number): number {
    const baseAmount =
      discount.discountType === DiscountType.percentage
        ? Math.floor((orderTotal * discount.value) / 100)
        : discount.value;

    return discount.maxDiscountValue
      ? Math.min(baseAmount, discount.maxDiscountValue)
      : baseAmount;
  }

  private async createOrder(
    userId: string,
    dto: ReqCreateOrderDto,
    orderData: OrderCalculationResult,
  ) {
    const createOrderParams: CreateOrderParams = {
      userId,
      addressId: dto.addressId,
      discountId: orderData.discountId,
      paymentMethod: dto.paymentMethod,
      orderTotal: orderData.orderTotal,
      discountAmount: orderData.discountAmount > 0 ? orderData.discountAmount : undefined,
      items: orderData.orderItems,
      note: dto.note,
    };

    return await this.orderQuery.createOrder(createOrderParams);
  }

  private async handlePostOrderOperations(
    order: any,
    orderData: OrderCalculationResult,
    dto: ReqCreateOrderDto,
    ipAddr: string,
  ): Promise<void> {
    try {
      if (order.discountId) {
        await this.discountQuery.updateUsedCount(order.discountId);
      }

      await this.cartQuery.clearCart(order.userId);

      if (dto.paymentMethod === PaymentMethod.cash) {
        await this.updateStock(orderData.orderItems, order.id);
      }

      await this.notificationService.sendNotificationAdminAndStaff(
        `Đơn hàng mới #${order.id}`,
        `Đơn hàng #${order.id} với tổng tiền ${orderData.finalTotal.toLocaleString('vi-VN')}đ`,
        NotificationType.order,
      );
    } catch (error) {
      throw error;
    }
  }

  private async updateStock(
    items: CreateOrderItem[],
    orderId: string,
  ): Promise<void> {
    try {
      await Promise.all(
        items.map((item) =>
          this.stockService.updateStock(
        item.productId,
        -item.quantity,
        ChangeType.sale,
        ReferenceType.order,
        orderId,
            `Trừ kho cho đơn hàng ${orderId}`,
          ),
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  private async formatOrderResponse(
    order: any,
    paymentMethod: PaymentMethod,
    ipAddr: string,
  ) {
    try {
      if (paymentMethod === PaymentMethod.vnpay) {
        const paymentUrl = await this.paymentQuery.buildPaymentUrl({
          amount: order.orderTotal,
          orderId: order.id,
          orderInfo: `Đơn hàng #${order.id}`,
          ipAddr,
        });
        return { ...order, paymentUrl };
      }
      return order;
    } catch (error) {
      throw error;
    }
  }

  private handleError(error: any): never {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new InternalServerErrorException('Lỗi khi tạo đơn hàng');
  }
}

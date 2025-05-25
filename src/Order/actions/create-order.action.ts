import { AddressQuery } from "@/Address/queries/address.query";
import { CartQuery } from "@/Cart/queries/cart.query";
import { DiscountQuery } from "@/Discount/queries/discount.query";
import { NotificationService } from "@/notification/domain/notification.service";
import { OrderQuery } from "@/Order/queries/order.query";
import { CreateOrderItem, CreateOrderParams } from "@/Order/queries/params/create-order.params";
import { BuildPaymentParams } from "@/Payment/queries/params/buil-payment.params";
import { PaymentQuery } from "@/Payment/queries/payment.query";
import { PrismaService } from "@/Prisma/prisma.service";
import { StockService } from "@/Stock/api/stock.service";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ChangeType, DiscountType, NotificationType, PaymentMethod, ReferenceType } from "@prisma/client";
import { ReqCreateOrderDto } from "../api/dto/reqCreateOrder.dto";
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
      await this.validateAddress(userId, dto.addressId);
      const { orderItems, orderTotal } = await this.prepareOrderItems(userId);
      const { discountId, finalTotal, discountAmount } = await this.calculateDiscount(dto.discountCode, orderTotal);
      const order = await this.createOrder(userId, dto, discountId, finalTotal, discountAmount, orderItems, dto.note);
      await this.cartQuery.clearCart(userId);
      // TODO: Create payment url
      if (dto.paymentMethod === PaymentMethod.vnpay) {
        const buildPaymentParams: BuildPaymentParams = {
          amount: order.orderTotal,
          orderId: order.id,
          orderInfo: `Đơn hàng #${order.id}`,
          ipAddr: ipAddr,
        }
        const paymentUrl = await this.paymentQuery.buildPaymentUrl(buildPaymentParams);
        return {
          ...order,
          paymentUrl,
        };
      }

      // Cập nhật kho cho thanh toán tiền mặt
      if (dto.paymentMethod === PaymentMethod.cash) {
        for (const item of orderItems) {
          await this.stockService.updateStock(
            item.productId,
            -item.quantity,
            ChangeType.sale,
            ReferenceType.order,
            order.id,
            `Trừ kho cho đơn hàng ${order.id}`,
          );
        }
      }

      await this.notificationService.sendNotificationAdminAndStaff(
        `Đơn hàng mới #${order.id}`,
        `Đơn hàng #${order.id} với tổng tiền ${finalTotal.toLocaleString('vi-VN')}đ`,
        NotificationType.order
      );
      //cập nhật kho
      return order;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi khi tạo đơn hàng');
    }
  }


  private async validateAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.addressQuery.findById(addressId);
    if (!address || address.userId !== userId) {
      throw new BadRequestException('Địa chỉ không hợp lệ');
    }
  }

  private async prepareOrderItems(userId: string): Promise<{ orderItems: CreateOrderItem[]; orderTotal: number }> {
    const cart = await this.cartQuery.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    let orderTotal = 0;
    const orderItems: CreateOrderItem[] = [];

    for (const item of cart.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.product.id },
      });

      if (!product) {
        throw new BadRequestException(`Sản phẩm ${item.product.id} không tồn tại`);
      }

      const price = product.salePrice || product.price;
      orderTotal += price * item.quantity;

      orderItems.push({
        productId: item.product.id,
        price: price,
        quantity: item.quantity,
      });
    }

    return { orderItems, orderTotal };
  }

  private async calculateDiscount(
    discountCode: string | undefined,
    orderTotal: number
  ): Promise<{ discountId: string | undefined; finalTotal: number; discountAmount: number }> {
    let discountId: string | undefined = undefined;
    let discountAmount = 0;

    if (!discountCode) {
      return { discountId, finalTotal: orderTotal, discountAmount };
    }

    const discount = await this.discountQuery.getDiscountByCode(discountCode);
    if (!discount || !discount.isActive) {
      return { discountId, finalTotal: orderTotal, discountAmount };
    }

    if (discount.minOrderTotal && orderTotal < discount.minOrderTotal) {
      throw new BadRequestException(`Tổng đơn hàng phải tối thiểu ${discount.minOrderTotal.toLocaleString('vi-VN')}đ`);
    }

    discountId = discount.id;
    discountAmount = this.calculateDiscountAmount(discount, orderTotal);

    return {
      discountId,
      finalTotal: orderTotal - discountAmount,
      discountAmount
    };
  }

  private calculateDiscountAmount(discount: any, orderTotal: number): number {
    let amount = discount.discountType === DiscountType.percentage
      ? Math.floor(orderTotal * discount.value / 100)
      : discount.value;

    if (discount.maxDiscountValue) {
      amount = Math.min(amount, discount.maxDiscountValue);
    }

    return amount;
  }

  private async createOrder(
    userId: string,
    dto: ReqCreateOrderDto,
    discountId: string | undefined,
    orderTotal: number,
    discountAmount: number,
    orderItems: CreateOrderItem[],
    note?: string
  ) {
    const createOrderParams: CreateOrderParams = {
      userId,
      addressId: dto.addressId,
      discountId,
      paymentMethod: dto.paymentMethod,
      orderTotal,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      items: orderItems,
      note,
    };
    return await this.orderQuery.createOrder(createOrderParams);
  }
}

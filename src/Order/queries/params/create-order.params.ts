import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export type CreateOrderItem = {
  productId: string;
  price: number;
  quantity: number;
};

export type CreateOrderParams = {
  userId: string;
  addressId: string;
  discountId?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paidAt?: Date;
  discountAmount?: number;
  orderTotal: number;
  shippingFee?: number;
  note?: string;
  items: CreateOrderItem[];
};

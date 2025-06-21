import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export type UpdateOrderParams = {
  id: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: Date;
  transactionId?: string;
  discountAmount?: number;
  orderTotal?: number;
  shippingFee?: number;
  note?: string;
};

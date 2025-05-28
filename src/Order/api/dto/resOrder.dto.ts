import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export class ResOrderItemDto {
  @ApiProperty({ description: 'Order item ID' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Item price' })
  price: number;

  @ApiProperty({ description: 'Item quantity' })
  quantity: number;
}

export class ResReviewDto {
  @ApiProperty({ description: 'Review ID' })
  id: string;

  @ApiProperty({ description: 'Rating' })
  rating: number;

  @ApiProperty({ description: 'Content' })
  content: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class ResOrderDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Address ID' })
  addressId: string;

  @ApiProperty({ description: 'Discount ID', required: false })
  discountId?: string;

  @ApiProperty({ description: 'Order status', enum: OrderStatus })
  orderStatus: OrderStatus;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Transaction ID', required: false })
  transactionId?: string;

  @ApiProperty({ description: 'Payment date', required: false })
  paidAt?: Date;

  @ApiProperty({ description: 'Discount amount', required: false })
  discountAmount?: number;

  @ApiProperty({ description: 'Order total' })
  orderTotal: number;

  @ApiProperty({ description: 'Shipping fee', required: false })
  shippingFee?: number;

  @ApiProperty({ description: 'Order note', required: false })
  note?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Order items', type: [ResOrderItemDto] })
  items: ResOrderItemDto[];

  @ApiProperty({ description: 'Payment url', required: false })
  paymentUrl?: string;

  @ApiProperty({ description: 'Reviews', type: [ResReviewDto] })
  reviews: ResReviewDto[];
} 
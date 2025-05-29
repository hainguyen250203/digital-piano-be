import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

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

  @ApiProperty({ description: 'Order item ID' })
  orderItemId: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class ResOrderDto {
  @ApiProperty({ description: 'Order ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'User ID' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'Address ID' })
  @Expose()
  addressId: string;

  @ApiProperty({ description: 'Discount ID', required: false })
  @Expose()
  discountId?: string;

  @ApiProperty({ description: 'Order status', enum: OrderStatus })
  @Expose()
  orderStatus: OrderStatus;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @Expose()
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @Expose()
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Transaction ID', required: false })
  @Expose()
  transactionId?: string;

  @ApiProperty({ description: 'Payment date', required: false })
  @Expose()
  paidAt?: Date;

  @ApiProperty({ description: 'Discount amount', required: false })
  @Expose()
  discountAmount?: number;

  @ApiProperty({ description: 'Order total' })
  @Expose()
  orderTotal: number;

  @ApiProperty({ description: 'Shipping fee', required: false })
  @Expose()
  shippingFee?: number;

  @ApiProperty({ description: 'Order note', required: false })
  @Expose()
  note?: string;

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Order items', type: [ResOrderItemDto] })
  @Expose()
  items: ResOrderItemDto[];

  @ApiProperty({ description: 'Payment url', required: false })
  @Expose()
  paymentUrl?: string;

  @ApiProperty({ description: 'Reviews', type: [ResReviewDto] })
  @Expose()
  reviews: ResReviewDto[];
} 
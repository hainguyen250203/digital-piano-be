import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

class OrderStatusCount {
  @ApiProperty({ description: 'Trạng thái đơn hàng', enum: OrderStatus })
  status: string;

  @ApiProperty({ description: 'Số lượng đơn hàng', example: 25 })
  count: number;
}

class PaymentStatusCount {
  @ApiProperty({ description: 'Trạng thái thanh toán', enum: PaymentStatus })
  status: string;

  @ApiProperty({ description: 'Số lượng đơn hàng', example: 18 })
  count: number;
}

class DateCount {
  @ApiProperty({ description: 'Ngày thống kê', example: '2023-05-01' })
  date: string;

  @ApiProperty({ description: 'Số lượng đơn hàng', example: 12 })
  count: number;
}

export class SalesStatisticsResponseDto {
  @ApiProperty({ type: [OrderStatusCount], description: 'Thống kê theo trạng thái đơn hàng' })
  @Expose()
  ordersByStatus: OrderStatusCount[];

  @ApiProperty({ type: [PaymentStatusCount], description: 'Thống kê theo trạng thái thanh toán' })
  @Expose()
  ordersByPaymentStatus: PaymentStatusCount[];

  @ApiProperty({ type: [DateCount], description: 'Thống kê đơn hàng theo ngày' })
  @Expose()
  ordersByDate: DateCount[];

  @ApiProperty({ description: 'Tổng số đơn hàng', example: 156 })
  @Expose()
  totalOrders: number;

}


import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '@prisma/client';

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

class SalesData {
  @ApiProperty({ type: [OrderStatusCount], description: 'Thống kê theo trạng thái đơn hàng' })
  ordersByStatus: OrderStatusCount[];

  @ApiProperty({ type: [PaymentStatusCount], description: 'Thống kê theo trạng thái thanh toán' })
  ordersByPaymentStatus: PaymentStatusCount[];

  @ApiProperty({ type: [DateCount], description: 'Thống kê đơn hàng theo ngày' })
  ordersByDate: DateCount[];

  @ApiProperty({ description: 'Tổng số đơn hàng', example: 156 })
  totalOrders: number;
}

export class SalesStatisticsResponseDto {
  @ApiProperty({ description: 'Ngày bắt đầu thống kê', example: '2023-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ description: 'Ngày kết thúc thống kê', example: '2023-12-31T23:59:59.000Z' })
  endDate: Date;

  @ApiProperty({ description: 'Khoảng thời gian thống kê', example: 'month' })
  period: string;

  @ApiProperty({ type: SalesData })
  data: SalesData;
} 
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

class DateRevenue {
  @ApiProperty({ description: 'Ngày thống kê', example: '2023-05-01' })
  date: string;

  @ApiProperty({ description: 'Doanh thu', example: 125000000 })
  revenue: number;
}

class PaymentMethodRevenue {
  @ApiProperty({ description: 'Phương thức thanh toán', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Doanh thu theo phương thức', example: 350000000 })
  revenue: number;
}

class RevenueData {
  @ApiProperty({ description: 'Tổng doanh thu', example: 1250000000 })
  totalRevenue: number;

  @ApiProperty({ type: [DateRevenue], description: 'Doanh thu theo ngày' })
  revenueByDate: DateRevenue[];

  @ApiProperty({ description: 'Giá trị đơn hàng trung bình', example: 3500000 })
  avgOrderValue: number;

  @ApiProperty({ type: [PaymentMethodRevenue], description: 'Doanh thu theo phương thức thanh toán' })
  revenueByPaymentMethod: PaymentMethodRevenue[];
}

export class RevenueStatisticsResponseDto {
  @ApiProperty({ description: 'Ngày bắt đầu thống kê', example: '2023-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ description: 'Ngày kết thúc thống kê', example: '2023-12-31T23:59:59.000Z' })
  endDate: Date;

  @ApiProperty({ description: 'Khoảng thời gian thống kê', example: 'month' })
  period: string;

  @ApiProperty({ type: RevenueData })
  data: RevenueData;
} 
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

class DateRevenue {
  @ApiProperty({ description: 'Ngày thống kê', example: '2023-05-01' })
  date: string;

  @ApiProperty({ description: 'Doanh thu bằng tiền mặt', example: 125000000 })
  cash: number;

  @ApiProperty({ description: 'Doanh thu bằng vnpay', example: 125000000 })
  vnpay: number;
}

export class RevenueStatisticsResponseDto {
  @ApiProperty({ type: [DateRevenue], description: 'Doanh thu theo ngày' })
  @Expose()
  revenueByDate: DateRevenue[];
}

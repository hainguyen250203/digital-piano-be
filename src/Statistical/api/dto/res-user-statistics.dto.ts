import { ApiProperty } from '@nestjs/swagger';

class DateCount {
  @ApiProperty({ description: 'Ngày thống kê', example: '2023-05-01' })
  date: string;

  @ApiProperty({ description: 'Số lượng người dùng mới', example: 15 })
  count: number;
}

class UserOrderInfo {
  @ApiProperty({ description: 'ID người dùng', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ description: 'Email người dùng', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Số điện thoại', example: '0901234567' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Số lượng đơn hàng', example: 12 })
  orderCount: number;
}

class UserSpendingInfo {
  @ApiProperty({ description: 'ID người dùng', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ description: 'Email người dùng', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Số điện thoại', example: '0901234567' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Tổng chi tiêu', example: 78000000 })
  totalSpending: number;
}

class UserStatisticsData {
  @ApiProperty({ description: 'Tổng số người dùng mới', example: 125 })
  totalNewUsers: number;

  @ApiProperty({ type: [DateCount], description: 'Người dùng mới theo ngày' })
  newUsersByDate: DateCount[];

  @ApiProperty({ description: 'Tổng số người dùng hoạt động', example: 350 })
  totalActiveUsers: number;

  @ApiProperty({ type: [UserOrderInfo], description: 'Khách hàng có nhiều đơn hàng nhất' })
  topCustomersByOrderCount: UserOrderInfo[];

  @ApiProperty({ type: [UserSpendingInfo], description: 'Khách hàng có tổng chi tiêu cao nhất' })
  topCustomersBySpending: UserSpendingInfo[];
}

export class UserStatisticsResponseDto {
  @ApiProperty({ description: 'Ngày bắt đầu thống kê', example: '2023-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ description: 'Ngày kết thúc thống kê', example: '2023-12-31T23:59:59.000Z' })
  endDate: Date;

  @ApiProperty({ description: 'Khoảng thời gian thống kê', example: 'month' })
  period: string;

  @ApiProperty({ type: UserStatisticsData })
  data: UserStatisticsData;
} 
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

class ProductBasicInfo {
  @ApiProperty({ description: 'ID sản phẩm', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Đàn Piano Điện Yamaha P-45' })
  name: string;
}

class StockInfo {
  @ApiProperty({ description: 'ID tồn kho', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ description: 'ID sản phẩm', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  productId: string;

  @ApiProperty({ description: 'Số lượng tồn kho', example: 5 })
  quantity: number;

  @ApiProperty({ type: ProductBasicInfo })
  product: ProductBasicInfo;
}

class OrderStatusCounts {
  @ApiProperty({ description: 'Số đơn hàng đang chờ xử lý', example: 15 })
  pending: number;

  @ApiProperty({ description: 'Số đơn hàng đang xử lý', example: 8 })
  processing: number;

  @ApiProperty({ description: 'Số đơn hàng đang vận chuyển', example: 12 })
  shipping: number;

  @ApiProperty({ description: 'Số đơn hàng đã giao', example: 45 })
  delivered: number;

  @ApiProperty({ description: 'Số đơn hàng đã hủy', example: 5 })
  cancelled: number;

  @ApiProperty({ description: 'Số đơn hàng đã trả lại', example: 3 })
  returned: number;
}

export class DashboardStatisticsResponseDto {

  @ApiProperty({ description: 'Tổng số đơn hàng', example: 1250 })
  @Expose()
  totalOrders: number;

  @ApiProperty({ description: 'Tổng số người dùng', example: 850 })
  @Expose()
  totalUsers: number;

  @ApiProperty({ description: 'Tổng số sản phẩm', example: 120 })
  @Expose()
  totalProducts: number;

  @ApiProperty({ description: 'Tổng doanh thu', example: 7500000000 })
  @Expose()
  totalRevenue: number;

  @ApiProperty({ description: 'Số đơn hàng hôm nay', example: 25 })
  @Expose()
  todayOrders: number;

  @ApiProperty({ description: 'Doanh thu hôm nay', example: 75000000 })
  @Expose()
  todayRevenue: number;

  @ApiProperty({ description: 'Số đơn hàng trong tháng', example: 350 })
  @Expose()
  monthlyOrders: number;

  @ApiProperty({ description: 'Doanh thu trong tháng', example: 1250000000 })
  @Expose()
  monthlyRevenue: number;

  @ApiProperty({ description: 'Số đơn hàng trong năm', example: 1250 })
  @Expose()
  yearlyOrders: number;

  @ApiProperty({ description: 'Doanh thu trong năm', example: 7500000000 })
  @Expose()
  yearlyRevenue: number;

  @ApiProperty({ type: [StockInfo], description: 'Sản phẩm sắp hết hàng' })
  @Expose()
  lowStockProducts: StockInfo[];

  @ApiProperty({ type: OrderStatusCounts, description: 'Thống kê trạng thái đơn hàng' })
  @Expose()
  orderStatusCounts: OrderStatusCounts;
}

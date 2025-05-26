import { ApiProperty } from '@nestjs/swagger';

class ProductBasicInfo {
  @ApiProperty({ description: 'ID sản phẩm', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Đàn Piano Điện Yamaha P-45' })
  name: string;

  @ApiProperty({ description: 'Giá sản phẩm', example: 15000000 })
  price: number;
}

class ProductSaleInfo {
  @ApiProperty({ type: ProductBasicInfo })
  product: ProductBasicInfo;

  @ApiProperty({ description: 'Tổng số lượng đã bán', example: 28 })
  totalQuantity: number;

  @ApiProperty({ description: 'Tổng doanh thu từ sản phẩm', example: 420000000 })
  totalRevenue: number;
}

class CategorySaleInfo {
  @ApiProperty({ description: 'ID danh mục', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  categoryId: string;

  @ApiProperty({ description: 'Tên danh mục', example: 'Đàn Piano' })
  categoryName: string;

  @ApiProperty({ description: 'Tổng số lượng đã bán', example: 120 })
  totalQuantity: number;

  @ApiProperty({ description: 'Tổng doanh thu từ danh mục', example: 1800000000 })
  totalRevenue: number;
}

class SubCategorySaleInfo {
  @ApiProperty({ description: 'ID danh mục con', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  subCategoryId: string;

  @ApiProperty({ description: 'Tên danh mục con', example: 'Đàn Piano Điện' })
  subCategoryName: string;

  @ApiProperty({ description: 'ID danh mục cha', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  categoryId: string;

  @ApiProperty({ description: 'Tên danh mục cha', example: 'Đàn Piano' })
  categoryName: string;

  @ApiProperty({ description: 'Tổng số lượng đã bán', example: 75 })
  totalQuantity: number;

  @ApiProperty({ description: 'Tổng doanh thu từ danh mục con', example: 1125000000 })
  totalRevenue: number;
}

class ProductStatisticsData {
  @ApiProperty({ type: [ProductSaleInfo], description: 'Sản phẩm bán chạy nhất' })
  bestSellingProducts: ProductSaleInfo[];

  @ApiProperty({ type: [CategorySaleInfo], description: 'Doanh số theo danh mục' })
  salesByCategory: CategorySaleInfo[];

  @ApiProperty({ type: [SubCategorySaleInfo], description: 'Doanh số theo danh mục con' })
  salesBySubCategory: SubCategorySaleInfo[];

  @ApiProperty({ type: [ProductSaleInfo], description: 'Sản phẩm có doanh thu cao nhất' })
  highestRevenueProducts: ProductSaleInfo[];
}

export class ProductStatisticsResponseDto {
  @ApiProperty({ description: 'Ngày bắt đầu thống kê', example: '2023-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ description: 'Ngày kết thúc thống kê', example: '2023-12-31T23:59:59.000Z' })
  endDate: Date;

  @ApiProperty({ description: 'Khoảng thời gian thống kê', example: 'month' })
  period: string;

  @ApiProperty({ description: 'ID danh mục để lọc (nếu có)', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  categoryId?: string;

  @ApiProperty({ description: 'ID danh mục con để lọc (nếu có)', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  subCategoryId?: string;

  @ApiProperty({ type: ProductStatisticsData })
  data: ProductStatisticsData;
} 
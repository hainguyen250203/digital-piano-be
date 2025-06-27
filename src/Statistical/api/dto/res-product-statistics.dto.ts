import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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

export class ProductStatisticsResponseDto {
  @ApiProperty({ type: [ProductSaleInfo], description: 'Sản phẩm bán chạy nhất' })
  @Expose()
  bestSellingProducts: ProductSaleInfo[];

  @ApiProperty({ type: [CategorySaleInfo], description: 'Doanh số theo danh mục' })
  @Expose()
  salesByCategory: CategorySaleInfo[];

  @ApiProperty({ type: [SubCategorySaleInfo], description: 'Doanh số theo danh mục con' })
  @Expose()
  salesBySubCategory: SubCategorySaleInfo[];

  @ApiProperty({ type: [ProductSaleInfo], description: 'Sản phẩm có doanh thu cao nhất' })
  @Expose()
  highestRevenueProducts: ProductSaleInfo[];
}


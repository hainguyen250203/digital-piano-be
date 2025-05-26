import { ApiProperty } from '@nestjs/swagger';
import { ChangeType, ReferenceType } from '@prisma/client';
import { StockSortType } from './get-stock-statistics.dto';

class StockLevelInfo {
  @ApiProperty({ description: 'ID kho', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  stockId: string;

  @ApiProperty({ description: 'ID sản phẩm', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  productId: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Đàn Piano Điện Yamaha P-45' })
  productName: string;

  @ApiProperty({ description: 'Số lượng tồn kho', example: 15 })
  quantity: number;

  @ApiProperty({ description: 'ID danh mục con', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  subCategoryId: string;

  @ApiProperty({ description: 'Tên danh mục con', example: 'Đàn Piano Điện' })
  subCategoryName: string;

  @ApiProperty({ description: 'ID danh mục', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  categoryId: string;

  @ApiProperty({ description: 'Tên danh mục', example: 'Đàn Piano' })
  categoryName: string;
}

class StockChangeInfo {
  @ApiProperty({ description: 'ID thay đổi', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ description: 'ID sản phẩm', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  productId: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Đàn Piano Điện Yamaha P-45' })
  productName: string;

  @ApiProperty({ description: 'Loại thay đổi', enum: ChangeType })
  changeType: ChangeType;

  @ApiProperty({ description: 'Lượng thay đổi', example: 10 })
  change: number;

  @ApiProperty({ description: 'Thời gian thay đổi', example: '2023-05-01T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Loại tham chiếu', enum: ReferenceType, nullable: true })
  referenceType?: ReferenceType;

  @ApiProperty({ description: 'ID tham chiếu', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', nullable: true })
  referenceId?: string;

  @ApiProperty({ description: 'Ghi chú', example: 'Nhập hàng từ nhà cung cấp', nullable: true })
  note?: string;
}

class ChangeTypeSummary {
  @ApiProperty({ description: 'Số lượng nhập', example: 250 })
  import: number;

  @ApiProperty({ description: 'Số lượng bán', example: -120 })
  sale: number;

  @ApiProperty({ description: 'Số lượng trả lại', example: 15 })
  return: number;

  @ApiProperty({ description: 'Số lượng hủy', example: 5 })
  cancel: number;

  @ApiProperty({ description: 'Số lượng điều chỉnh', example: -10 })
  adjustment: number;
}

class StockMovementInfo {
  @ApiProperty({ type: [StockChangeInfo], description: 'Lịch sử thay đổi gần đây' })
  recentChanges: StockChangeInfo[];

  @ApiProperty({ type: ChangeTypeSummary, description: 'Thống kê theo loại thay đổi' })
  changeTypeSummary: ChangeTypeSummary;
}

class RecentInvoiceInfo {
  @ApiProperty({ description: 'ID hóa đơn nhập', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ description: 'ID nhà cung cấp', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  supplierId: string;

  @ApiProperty({ description: 'Tên nhà cung cấp', example: 'Yamaha Việt Nam' })
  supplierName: string;

  @ApiProperty({ description: 'Tổng tiền nhập', example: 125000000 })
  totalAmount: number;

  @ApiProperty({ description: 'Thời gian tạo', example: '2023-05-01T10:30:00.000Z' })
  createdAt: Date;
}

class TopProductImportInfo {
  @ApiProperty({ description: 'ID sản phẩm', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  productId: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Đàn Piano Điện Yamaha P-45' })
  productName: string;

  @ApiProperty({ description: 'Tổng giá trị nhập', example: 75000000 })
  totalImportValue: number;

  @ApiProperty({ description: 'Tổng số lượng nhập', example: 15 })
  totalQuantity: number;

  @ApiProperty({ description: 'Giá nhập trung bình', example: 5000000 })
  averageImportPrice: number;
}

class ImportValueData {
  @ApiProperty({ description: 'Tổng giá trị nhập hàng', example: 500000000 })
  totalImportValue: number;

  @ApiProperty({ description: 'Tổng số lượng sản phẩm đã nhập', example: 350 })
  totalImportQuantity: number;

  @ApiProperty({ description: 'Tổng số lượng đã bán', example: 275 })
  totalSalesQuantity: number;

  @ApiProperty({ description: 'Tổng số lượng đã trả lại', example: 15 })
  totalReturnsQuantity: number;

  @ApiProperty({ type: [RecentInvoiceInfo], description: 'Hóa đơn nhập gần đây' })
  recentInvoices: RecentInvoiceInfo[];

  @ApiProperty({ type: [TopProductImportInfo], description: 'Sản phẩm có giá trị nhập cao nhất' })
  topProductsByImportValue: TopProductImportInfo[];
}

class StockSummary {
  @ApiProperty({ description: 'Số sản phẩm hết hàng', example: 5 })
  outOfStockCount: number;

  @ApiProperty({ description: 'Số sản phẩm sắp hết hàng', example: 12 })
  lowStockCount: number;
}

class StockStatisticsData {
  @ApiProperty({ type: [StockLevelInfo], description: 'Thông tin tồn kho sản phẩm' })
  stockLevels: StockLevelInfo[];

  @ApiProperty({ type: StockMovementInfo, description: 'Thông tin thay đổi tồn kho' })
  stockMovement: StockMovementInfo;

  @ApiProperty({ type: [StockLevelInfo], description: 'Sản phẩm đã hết hàng' })
  outOfStockProducts: StockLevelInfo[];

  @ApiProperty({ type: [StockLevelInfo], description: 'Sản phẩm sắp hết hàng' })
  lowStockProducts: StockLevelInfo[];

  @ApiProperty({ type: ImportValueData, description: 'Dữ liệu giá trị nhập hàng' })
  importValueData: ImportValueData;

  @ApiProperty({ type: StockSummary, description: 'Tóm tắt tồn kho' })
  stockSummary: StockSummary;
}

export class StockStatisticsResponseDto {
  @ApiProperty({ description: 'Cách sắp xếp', enum: StockSortType, default: StockSortType.LOW_STOCK })
  sortBy: StockSortType;

  @ApiProperty({ description: 'ID danh mục để lọc (nếu có)', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', nullable: true })
  categoryId?: string;

  @ApiProperty({ description: 'ID danh mục con để lọc (nếu có)', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', nullable: true })
  subCategoryId?: string;

  @ApiProperty({ type: StockStatisticsData })
  data: StockStatisticsData;
} 
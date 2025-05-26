import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum StockSortType {
  LOW_STOCK = 'low_stock',
  HIGH_STOCK = 'high_stock',
  MOST_CHANGED = 'most_changed',
}

export class GetStockStatisticsDto {
  @ApiProperty({ 
    required: false, 
    enum: StockSortType,
    description: 'Cách sắp xếp thống kê tồn kho (tồn ít, tồn nhiều, thay đổi nhiều)',
    default: StockSortType.LOW_STOCK
  })
  @IsEnum(StockSortType)
  @IsOptional()
  sortBy?: StockSortType;
} 
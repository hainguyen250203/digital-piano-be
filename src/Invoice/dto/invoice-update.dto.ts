import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

// Basic invoice update DTO
export class UpdateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'note phải là chuỗi' })
  note?: string;
}

// Single invoice item update DTO
export class UpdateInvoiceItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'quantity phải là số' })
  @IsPositive({ message: 'quantity phải lớn hơn 0' })
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'importPrice phải là số' })
  @IsPositive({ message: 'importPrice phải lớn hơn 0' })
  importPrice?: number;
}

// Item reference for batch update
export class BatchUpdateItemDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'id không được để trống' })
  @IsUUID('4', { message: 'id phải là UUID hợp lệ' })
  id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'quantity phải là số' })
  @IsPositive({ message: 'quantity phải lớn hơn 0' })
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'importPrice phải là số' })
  @IsPositive({ message: 'importPrice phải lớn hơn 0' })
  importPrice?: number;
}

// Batch update DTO for multiple items
export class BatchUpdateInvoiceItemsDto {
  @ApiProperty({ type: [BatchUpdateItemDto], description: 'Array of items to update' })
  @IsArray({ message: 'items phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateItemDto)
  items: BatchUpdateItemDto[];
}

// Combined DTO for updating invoice and its items
export class UpdateInvoiceWithItemsDto {
  // Invoice basic info
  @ApiPropertyOptional()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'note phải là chuỗi' })
  note?: string;

  // Invoice items to update
  @ApiPropertyOptional({ type: [BatchUpdateItemDto], description: 'Items to update' })
  @IsOptional()
  @IsArray({ message: 'items phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateItemDto)
  items?: BatchUpdateItemDto[];
} 
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

// Request DTOs for creating invoices
export class CreateInvoiceItemDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'productId không được để trống' })
  @IsUUID('4', { message: 'productId phải là UUID hợp lệ' })
  productId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'quantity không được để trống' })
  @IsNumber({}, { message: 'quantity phải là số' })
  @IsPositive({ message: 'quantity phải lớn hơn 0' })
  quantity: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'importPrice không được để trống' })
  @IsNumber({}, { message: 'importPrice phải là số' })
  @IsPositive({ message: 'importPrice phải lớn hơn 0' })
  importPrice: number;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'supplierId không được để trống' })
  @IsUUID('4', { message: 'supplierId phải là UUID hợp lệ' })
  supplierId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'note phải là chuỗi' })
  note?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray({ message: 'items phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}

// Query parameters for listing invoices
export class GetInvoiceParamsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'page phải là số' })
  @Min(1, { message: 'page phải lớn hơn hoặc bằng 1' })
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'limit phải là số' })
  @Min(1, { message: 'limit phải lớn hơn hoặc bằng 1' })
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'startDate phải là định dạng ngày tháng hợp lệ' })
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'endDate phải là định dạng ngày tháng hợp lệ' })
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string;
} 
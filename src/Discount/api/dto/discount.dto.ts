import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// Query Parameters DTO
export class GetDiscountParamsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'page phải là số' })
  @Min(1, { message: 'page phải lớn hơn hoặc bằng 1' })
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'limit phải là số' })
  @Min(1, { message: 'limit phải lớn hơn hoặc bằng 1' })
  @Type(() => Number)
  limit?: number;
}

// Create DTO
export class CreateDiscountDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'code không được để trống' })
  @IsString({ message: 'code phải là chuỗi' })
  @MaxLength(50, { message: 'code không được vượt quá 50 ký tự' })
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'description phải là chuỗi' })
  description?: string;

  @ApiProperty({ enum: DiscountType })
  @IsNotEmpty({ message: 'discountType không được để trống' })
  @IsEnum(DiscountType, { message: 'discountType phải là giá trị hợp lệ' })
  discountType: DiscountType;

  @ApiProperty()
  @IsNotEmpty({ message: 'value không được để trống' })
  @IsNumber({}, { message: 'value phải là số' })
  @IsPositive({ message: 'value phải lớn hơn 0' })
  value: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'startDate phải là chuỗi ngày hợp lệ (ISO)' })
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'endDate phải là chuỗi ngày hợp lệ (ISO)' })
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'maxUses phải là số' })
  @Min(0, { message: 'maxUses phải lớn hơn hoặc bằng 0' })
  maxUses?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'minOrderTotal phải là số' })
  @IsPositive({ message: 'minOrderTotal phải lớn hơn 0' })
  minOrderTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'maxDiscountValue phải là số' })
  @IsPositive({ message: 'maxDiscountValue phải lớn hơn 0' })
  maxDiscountValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;
}

// Update DTO
export class UpdateDiscountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'code phải là chuỗi' })
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'description phải là chuỗi' })
  description?: string;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType, { message: 'discountType phải là giá trị hợp lệ' })
  discountType?: DiscountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'value phải là số' })
  @IsPositive({ message: 'value phải lớn hơn 0' })
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'startDate phải là chuỗi ngày hợp lệ (ISO)' })
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'endDate phải là chuỗi ngày hợp lệ (ISO)' })
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'maxUses phải là số' })
  @Min(0, { message: 'maxUses phải lớn hơn hoặc bằng 0' })
  maxUses?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'minOrderTotal phải là số' })
  @IsPositive({ message: 'minOrderTotal phải lớn hơn 0' })
  minOrderTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'maxDiscountValue phải là số' })
  @IsPositive({ message: 'maxDiscountValue phải lớn hơn 0' })
  maxDiscountValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'isDeleted phải là boolean' })
  isDeleted?: boolean;
}

// Response DTOs
export class DiscountResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  code: string;

  @Expose()
  @ApiPropertyOptional()
  description?: string;

  @Expose()
  @ApiProperty({ enum: DiscountType })
  discountType: DiscountType;

  @Expose()
  @ApiProperty()
  value: number;

  @Expose()
  @ApiPropertyOptional()
  startDate?: Date;

  @Expose()
  @ApiPropertyOptional()
  endDate?: Date;

  @Expose()
  @ApiPropertyOptional()
  maxUses?: number;

  @Expose()
  @ApiPropertyOptional()
  minOrderTotal?: number;

  @Expose()
  @ApiPropertyOptional()
  maxDiscountValue?: number;

  @Expose()
  @ApiProperty()
  usedCount: number;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  isDeleted: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}


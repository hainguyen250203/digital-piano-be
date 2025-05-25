import { ApiProperty } from '@nestjs/swagger';
import { JsonObject } from '@prisma/client/runtime/library';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ReqUpdateProductDto {
  @ApiProperty({ description: 'Product name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Product description', required: false })
  @IsOptional()
  description?: JsonObject;

  @ApiProperty({ description: 'Product price in cents', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'Sale price in cents', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  salePrice?: number;

  @ApiProperty({ description: 'Product video URL', required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ description: 'Whether the product is on hot sale', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isHotSale?: boolean;

  @ApiProperty({ description: 'Whether the product is featured', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isFeatured?: boolean;

  @ApiProperty({ description: 'Brand ID', required: false })
  @IsUUID()
  @IsOptional()
  brandId?: string;

  @ApiProperty({ description: 'Product type ID', required: false })
  @IsUUID()
  @IsOptional()
  productTypeId?: string;

  @ApiProperty({ description: 'Subcategory ID', required: false })
  @IsUUID()
  @IsOptional()
  subCategoryId?: string;

  @ApiProperty({ description: 'Whether the product is deleted', required: false })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @ApiProperty({ description: 'Default image ID - ID of an existing image to set as default', required: false })
  @IsUUID()
  @IsOptional()
  defaultImageId?: string;

  @ApiProperty({ description: 'Image IDs to delete', required: false, type: [String] })
  @IsOptional()
  imageIdsToDelete?: string | string[];
} 
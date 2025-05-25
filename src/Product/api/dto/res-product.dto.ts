import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export class ProductImageDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  url: string;
}

export class ProductBrandDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;
}

export class ProductTypeDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;
}

export class ProductStockDto {
  @Expose()
  @ApiProperty()
  quantity: number;
}

export class SubCategoryDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;
}

export class CategoryDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;
}

export class ResProductDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty({ required: false })
  description?: string;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty({ required: false })
  salePrice?: number;

  @Expose()
  @ApiProperty({ required: false })
  videoUrl?: string;

  @Expose()
  @ApiProperty({ type: ProductImageDto })
  @Type(() => ProductImageDto)
  defaultImage: ProductImageDto;

  @Expose()
  @ApiProperty()
  isHotSale: boolean;

  @Expose()
  @ApiProperty()
  isFeatured: boolean;

  @Expose()
  @ApiProperty()
  isDeleted: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @Type(() => ProductBrandDto)
  @ApiProperty({ type: ProductBrandDto })
  brand: ProductBrandDto;

  @Expose()
  @Type(() => ProductTypeDto)
  @ApiProperty({ type: ProductTypeDto })
  productType: ProductTypeDto;

  @Expose()
  @Type(() => SubCategoryDto)
  @ApiProperty({ type: SubCategoryDto })
  subCategory: SubCategoryDto;

  @Expose()
  @Transform(({ obj }) => obj.subCategory?.category)
  @Type(() => CategoryDto)
  @ApiProperty({ type: CategoryDto })
  category: CategoryDto;

  @Expose()
  @Type(() => ProductImageDto)
  @ApiProperty({ type: [ProductImageDto] })
  images: ProductImageDto[];

  @Expose()
  @Type(() => ProductStockDto)
  @ApiProperty({ type: ProductStockDto })
  stock: ProductStockDto;
} 
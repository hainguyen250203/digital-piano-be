import { Expose, Transform, Type } from 'class-transformer';

import { CategoryDto, ProductBrandDto, ProductStockDto, ProductTypeDto, SubCategoryDto } from '@/Product/api/dto/res-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DefaultImage {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  url: string;
}
export class ResAllProductDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty({ required: false })
  salePrice?: number;

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
  defaultImage: DefaultImage;

  @Expose()
  @Type(() => ProductStockDto)
  @ApiProperty({ type: ProductStockDto })
  stock: ProductStockDto;

  @Expose()
  @Type(() => ProductTypeDto)
  @ApiProperty({ type: ProductTypeDto })
  productType: ProductTypeDto;

  @Expose()
  @Transform(({ obj }) => obj.subCategory?.category)
  @Type(() => CategoryDto)
  @ApiProperty({ type: CategoryDto })
  category: CategoryDto;


  @Expose()
  @Type(() => ProductBrandDto)
  @ApiProperty({ type: ProductBrandDto })
  brand: ProductBrandDto;

  @Expose()
  @Type(() => SubCategoryDto)
  @ApiProperty({ type: SubCategoryDto })
  subCategory: SubCategoryDto;
}

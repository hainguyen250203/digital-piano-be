import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class ProductTypeDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;
}

class SubCategoryDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ type: [ProductTypeDto] })
  @Expose()
  @Type(() => ProductTypeDto)
  productTypes: ProductTypeDto[];
}

export class ResMenuDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ type: [SubCategoryDto] })
  @Expose()
  @Type(() => SubCategoryDto)
  subCategories: SubCategoryDto[];
} 
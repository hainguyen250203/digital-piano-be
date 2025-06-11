import { ResProductByCollectionDto } from '@/Product/api/dto/res-product-by-collection.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ResProductBySubCategoryDto extends ResProductByCollectionDto {
  @Transform(({ obj }) => ({
    id: obj.category?.id,
    name: obj.category?.name,
  }))
  @ApiProperty()
  @Expose()
  category: { id: string; name: string };
}

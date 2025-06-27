import { ResAllProductDto } from '@/Product/api/dto/res-all-product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ResProductByCollectionDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  @Type(() => ResAllProductDto)
  products: ResAllProductDto[];

}
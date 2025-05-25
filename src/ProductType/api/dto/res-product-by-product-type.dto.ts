import { ResProductByCollectionDto } from "@/Product/api/dto/res-product-by-collection.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

export class ResProductByProductTypeDto extends ResProductByCollectionDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => ({
    id: obj.category?.id,
    name: obj.category?.name,
  }))
  category: { id: string; name: string };
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => ({
    id: obj.subCategory?.id,
    name: obj.subCategory?.name,
  }))
  subCategory: { id: string; name: string };
}
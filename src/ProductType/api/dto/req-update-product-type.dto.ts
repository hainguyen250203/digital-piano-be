import { UpdateProductTypeParams } from '@/ProductType/queries/dto/update-product-type.params';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ReqUpdateProductTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  toUpdateProductTypeParams(id: string): UpdateProductTypeParams {
    return {
      id,
      name: this.name,
      subCategoryId: this.subCategoryId,
      isDeleted: this.isDeleted
    };
  }
}

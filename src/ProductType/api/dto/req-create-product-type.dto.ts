import { CreateProductTypeParams } from '@/ProductType/queries/dto/create-product-type.params';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ReqCreateProductTypeDto {
  @ApiProperty()
  @IsString({ message: 'Tên loại sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên loại sản phẩm không được để trống' })
  name: string;

  @ApiProperty()
  @IsString({ message: 'ID danh mục con phải là chuỗi ký tự' })
  @IsUUID('4', { message: 'ID danh mục con phải đúng định dạng UUID v4' })
  @IsNotEmpty({ message: 'ID danh mục con là bắt buộc' })
  subCategoryId: string;

  toParams(): CreateProductTypeParams {
    return {
      name: this.name,
      subCategoryId: this.subCategoryId
    };
  }
}

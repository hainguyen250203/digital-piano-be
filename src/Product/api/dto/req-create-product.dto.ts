import { CreateProductQueryParams } from '@/Product/queries/dto/create-product.params';
import { ApiProperty } from '@nestjs/swagger';
import { JsonObject } from '@prisma/client/runtime/library';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsJSON, IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl, Min } from 'class-validator';
export class ReqCreateProductDto {
  @ApiProperty({ description: 'Tên sản phẩm', required: true })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống.' })
  name: string;

  @ApiProperty({ description: 'Mô tả sản phẩm', required: true })
  @IsOptional()
  @IsString({ message: 'Mô tả sản phẩm phải là chuỗi ký tự.' })
  @IsJSON({ message: 'Mô tả sản phẩm phải là đối tượng JSON hợp lệ.' })
  description: JsonObject;

  @ApiProperty({ description: 'Giá sản phẩm', required: true })
  @Type(() => Number)
  @IsInt({ message: 'Giá sản phẩm phải là số nguyên.' })
  @Min(0, { message: 'Giá sản phẩm không được nhỏ hơn 0.' })
  price: number;

  @ApiProperty({ description: 'Giá khuyến mãi', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Giá khuyến mãi phải là số nguyên.' })
  @Min(0, { message: 'Giá khuyến mãi không được nhỏ hơn 0.' })
  salePrice?: number;

  @ApiProperty({ description: 'Đường dẫn video', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'Đường dẫn video không hợp lệ.' })
  videoUrl?: string;

  @ApiProperty({ description: 'Sản phẩm nổi bật (Hot Sale)', required: false })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  isHotSale?: boolean;

  @ApiProperty({ description: 'Sản phẩm tiêu biểu', required: false })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ description: 'ID loại sản phẩm', required: true })
  @IsOptional()
  productTypeId?: string;

  @ApiProperty({ description: 'ID thương hiệu', required: true })
  @IsNotEmpty({ message: 'ID thương hiệu không được để trống.' })
  @IsUUID(undefined, { message: 'ID thương hiệu không hợp lệ. Định dạng UUID yêu cầu.' })
  brandId: string;

  @ApiProperty({ description: 'ID danh mục con', required: true })
  @IsNotEmpty({ message: 'ID danh mục con không được để trống.' })
  @IsUUID(undefined, { message: 'ID danh mục con không hợp lệ. Định dạng UUID yêu cầu.' })
  subCategoryId: string;

  @ApiProperty({ description: 'Chỉ số ảnh mặc định (0-based)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Chỉ số ảnh mặc định phải là số nguyên.' })
  @Min(0, { message: 'Chỉ số ảnh mặc định không được nhỏ hơn 0.' })
  defaultImageIndex?: number;

  @ApiProperty({ description: 'Field name hoặc index của ảnh mặc định', required: false })
  @IsOptional()
  @IsString({ message: 'Tên field ảnh mặc định phải là chuỗi ký tự.' })
  defaultImageField?: string;

  toCreateProductParam(images: string[], defaultImageUrl?: string): CreateProductQueryParams {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      salePrice: this.salePrice,
      videoUrl: this.videoUrl,
      isHotSale: this.isHotSale,
      isFeatured: this.isFeatured,
      productTypeId: this.productTypeId,
      brandId: this.brandId,
      subCategoryId: this.subCategoryId,
      images,
      defaultImageUrl
    };
  }
}

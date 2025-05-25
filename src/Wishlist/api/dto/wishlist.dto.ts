import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

// Query Parameters DTO
export class GetWishlistParamsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'page phải là số' })
  @Min(1, { message: 'page phải lớn hơn hoặc bằng 1' })
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'limit phải là số' })
  @Min(1, { message: 'limit phải lớn hơn hoặc bằng 1' })
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'userId phải là chuỗi' })
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'sort phải là chuỗi' })
  sort?: string;
}

// Create DTO
export class CreateWishlistDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'productId không được để trống' })
  @IsUUID('4', { message: 'productId phải là UUID hợp lệ' })
  productId: string;
}



// Response DTOs
export class ProductResponseDto {
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
  @ApiPropertyOptional()
  salePrice?: number;

  @Expose()
  @ApiProperty  ()
  @Transform(({ obj }) => obj.product.defaultImage.url)
  defaultImage: string;
}

export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;
}

export class WishlistResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  userId: string;

  @Expose()
  @ApiProperty()
  productId: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  product?: ProductResponseDto;
}


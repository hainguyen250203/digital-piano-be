import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class ReqAddProductToCard {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  productId: string;
}

export class DefaultImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  url: string;
}

export class ProductDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  price: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Expose()
  salePrice?: number;

  @ApiProperty({ required: false, type: DefaultImageDto })
  @Type(() => DefaultImageDto)
  @IsOptional()
  @Expose()
  defaultImage?: DefaultImageDto;
}

export class CartItemDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  quantity: number;

  @ApiProperty({ type: ProductDto })
  @Type(() => ProductDto)
  @Expose()
  product: ProductDto;
}

export class ResCartDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  userId: string;

  @ApiProperty({ type: [CartItemDto] })
  @Type(() => CartItemDto)
  @Expose()
  items: CartItemDto[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  totalQuantity: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  totalPrice: number;
}

export class UpdateCartItemQuantityDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  quantity: number;
}

export class CartItemIdParamDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  cartItemId: string;
}

export class UpdateCartItemDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  quantity: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductReturnDto {
  @ApiProperty({ description: 'ID của order item muốn trả', example: '...' })
  @IsUUID()
  @IsNotEmpty()
  orderItemId: string;

  @ApiProperty({ description: 'Số lượng muốn trả', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Lý do trả hàng', example: 'Sản phẩm bị lỗi' })
  @IsString()
  @IsNotEmpty()
  reason: string;
} 
import { ApiProperty } from '@nestjs/swagger';
import { ReturnStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class ResProductReturnOrderItemProductDto {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ required: false })
  @Expose()
  defaultImage?: any;
}

export class ResProductReturnOrderItemDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty({ type: ResProductReturnOrderItemProductDto })
  @Type(() => ResProductReturnOrderItemProductDto)
  @Expose()
  product: ResProductReturnOrderItemProductDto;
}

export class ResProductReturnDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  orderId: string;

  @ApiProperty()
  @Expose()
  orderItemId: string;

  @ApiProperty()
  @Expose()
  quantity: number;

  @ApiProperty()
  @Expose()
  reason: string;

  @ApiProperty({ enum: ReturnStatus })
  @Expose()
  status: ReturnStatus;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: ResProductReturnOrderItemDto })
  @Type(() => ResProductReturnOrderItemDto)
  @Expose()
  orderItem: ResProductReturnOrderItemDto;
} 
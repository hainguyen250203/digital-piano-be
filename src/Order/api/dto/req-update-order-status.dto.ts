import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ReqUpdateOrderStatusDto {
  @ApiProperty({
    description: 'Trạng thái đơn hàng',
    enum: OrderStatus,
    example: OrderStatus.pending,
  })
  @IsNotEmpty({ message: 'Trạng thái đơn hàng không được để trống' })
  @IsEnum(OrderStatus, { message: 'Trạng thái đơn hàng không hợp lệ' })
  status: OrderStatus;
}

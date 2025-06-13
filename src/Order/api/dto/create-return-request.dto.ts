import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateReturnRequestDto {
  @ApiProperty({
    description: 'ID of the order item to return',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  orderItemId: string;

  @ApiProperty({
    description: 'Quantity of items to return',
    example: 1,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Reason for return',
    example: 'Product damaged during delivery'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
} 
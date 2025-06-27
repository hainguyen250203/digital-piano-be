import { ApiProperty } from '@nestjs/swagger';
import { ReturnStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateProductReturnStatusDto {
  @ApiProperty({ enum: ReturnStatus })
  @IsEnum(ReturnStatus)
  @IsNotEmpty()
  status: ReturnStatus;
} 
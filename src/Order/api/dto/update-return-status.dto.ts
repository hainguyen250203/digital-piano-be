import { ApiProperty } from '@nestjs/swagger';
import { ReturnStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateReturnStatusDto {
  @ApiProperty({
    description: 'New status for the return request',
    enum: ReturnStatus,
    example: ReturnStatus.APPROVED
  })
  @IsEnum(ReturnStatus)
  @IsNotEmpty()
  status: ReturnStatus;

  @ApiProperty({
    description: 'Admin note for the status update',
    required: false,
    example: 'Return request approved after inspection'
  })
  @IsString()
  @IsOptional()
  adminNote?: string;
} 
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ReqUpdateBlockStatusDto {
  @ApiProperty()
  @IsBoolean({ message: 'isBlock must be a boolean' })
  @IsNotEmpty({ message: 'isBlock is required' })
  isBlock: boolean;
} 
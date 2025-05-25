import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReqSetDefaultImageDto {
  @ApiProperty({ 
    description: 'ID of the image to set as default',
    required: true
  })
  @IsUUID()
  imageId: string;
} 
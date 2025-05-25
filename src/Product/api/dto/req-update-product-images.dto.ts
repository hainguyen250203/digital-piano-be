import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ReqUpdateProductImagesDto {
  @ApiProperty({ 
    description: 'Index of image to set as default (0-based)',
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  defaultImageIndex?: number;

  @ApiProperty({ 
    description: 'Whether to keep existing images when adding new ones',
    required: false,
    default: 'false'
  })
  @IsString()
  @IsOptional()
  keepExistingImages?: string;
} 
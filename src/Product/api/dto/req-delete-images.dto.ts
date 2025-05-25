import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ReqDeleteImagesDto {
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  imageIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageId?: string;
}

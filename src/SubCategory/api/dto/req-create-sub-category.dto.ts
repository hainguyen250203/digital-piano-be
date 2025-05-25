import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReqCreateSubCategoryDto {
  @ApiProperty()
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiProperty()
  @IsString({ message: 'categoryId must be a string' })
  @IsNotEmpty({ message: 'categoryId is required' })
  categoryId: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReqUpdateSubCategoryDto {
  @ApiProperty()
  @IsString({ message: 'name must be a string' })
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString({ message: 'categoryId must be a string' })
  @IsOptional()
  categoryId: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isDeleted: boolean;
}

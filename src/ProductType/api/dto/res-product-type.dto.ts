import { ApiProperty } from '@nestjs/swagger';
import { SubCategory } from '@prisma/client';
import { Expose } from 'class-transformer';

export class ResProductTypeDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  name: string;
  @ApiProperty()
  @Expose()
  isDeleted: boolean;
  @ApiProperty()
  @Expose()
  createdAt: Date;
  @ApiProperty()  
  @Expose()
  updatedAt: Date;
  @ApiProperty()
  @Expose()
  subCategory: SubCategory;
}

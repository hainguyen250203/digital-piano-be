import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class SimpleDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;
}

export class ResProductTypeDetailDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: () => SimpleDto })
  @Expose()
  @Type(() => SimpleDto)
  subCategory: SimpleDto;
}

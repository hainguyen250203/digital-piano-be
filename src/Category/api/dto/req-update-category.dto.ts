import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ReqUpdateCategoryDto {
  @ApiProperty()
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiProperty()
  @IsBoolean({ message: 'isDeleted must be a boolean' })
  @IsNotEmpty({ message: 'isDeleted is required' })
  isDeleted: boolean;
}

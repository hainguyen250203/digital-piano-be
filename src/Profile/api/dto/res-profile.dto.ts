import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResProfileDto {
  @ApiProperty()
  @Expose()
  email: string;
  
  @ApiProperty()
  @Expose()
  avatarUrl: string;
  
  @ApiProperty()
  @Expose()
  phoneNumber: string;
  
  @ApiProperty()
  @Expose()
  role: string;
} 
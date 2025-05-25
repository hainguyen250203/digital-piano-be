import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResAccessTokenDto {
  @ApiProperty()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @Expose()
  role: string;
}

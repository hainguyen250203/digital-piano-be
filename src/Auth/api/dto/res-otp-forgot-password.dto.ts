import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';


export class ResOtpForgotPasswordDto {
  @ApiProperty()
  @Expose()
  otpSecret: string;
}


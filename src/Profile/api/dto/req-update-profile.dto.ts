import { UpdateProfileParams } from '@/Profile/queries/dto/update-profile.params';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Số điện thoại  phải là chuỗi ký tự.' })
  @Matches(/^[0-9]{9,15}$/, {
    message: 'Số điện thoại phải là dãy số từ 9 đến 15 chữ số.'
  })
  phoneNumber?: string;

  toParams(userId: string): UpdateProfileParams {
    return {
      userId,
      phoneNumber: this.phoneNumber
    };
  }
}

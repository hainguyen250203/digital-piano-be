import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReqCreateAddressDto {
  @ApiProperty({
    description: 'Họ tên người nhận',
    example: 'Nguyễn Văn A'
  })
  @IsNotEmpty({ message: 'Họ tên người nhận không được để trống' })
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0123456789'
  })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    description: 'Số nhà, tên đường',
    example: '123 Đường Nguyễn Huệ'
  })
  @IsNotEmpty({ message: 'Số nhà, tên đường không được để trống' })
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiProperty({
    description: 'Phường/Xã',
    example: 'Phường Bến Nghé'
  })
  @IsNotEmpty({ message: 'Phường/Xã không được để trống' })
  @IsString()
  @MaxLength(100)
  ward: string;

  @ApiProperty({
    description: 'Quận/Huyện',
    example: 'Quận 1'
  })
  @IsNotEmpty({ message: 'Quận/Huyện không được để trống' })
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiProperty({
    description: 'Tỉnh/Thành phố',
    example: 'TP Hồ Chí Minh'
  })
  @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Đặt làm địa chỉ mặc định',
    example: false
  })
  @IsBoolean()
  isDefault?: boolean;
} 
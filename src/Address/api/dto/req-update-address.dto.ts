import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ReqUpdateAddressDto {

  @ApiProperty({
    description: 'Họ tên người nhận',
    example: 'Nguyễn Văn A'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0123456789'
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Số nhà, tên đường',
    example: '123 Đường Nguyễn Huệ'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @ApiProperty({
    description: 'Phường/Xã',
    example: 'Phường Bến Nghé'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @ApiProperty({
    description: 'Quận/Huyện',
    example: 'Quận 1'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({
    description: 'Tỉnh/Thành phố',
    example: 'TP Hồ Chí Minh'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    description: 'Đặt làm địa chỉ mặc định',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
} 
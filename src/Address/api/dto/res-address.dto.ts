import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
export class ResAddressDto {
  @ApiProperty({
    description: 'Mã địa chỉ',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Mã người dùng',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Họ tên người nhận',
    example: 'Nguyễn Văn A'
  })
  @Expose()
  fullName: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0123456789'
  })
  @Expose()
  phone: string;

  @ApiProperty({
    description: 'Số nhà, tên đường',
    example: '123 Đường Nguyễn Huệ'
  })
  @Expose()
  street: string;

  @ApiProperty({
    description: 'Phường/Xã',
    example: 'Phường Bến Nghé'
  })
  @Expose()
  ward: string;

  @ApiProperty({
    description: 'Quận/Huyện',
    example: 'Quận 1'
  })
  @Expose()
  district: string;

  @ApiProperty({
    description: 'Tỉnh/Thành phố',
    example: 'TP Hồ Chí Minh'
  })
  @Expose()
  city: string;

  @ApiProperty({
    description: 'Là địa chỉ mặc định',
    example: false
  })
  @Expose()
  isDefault: boolean;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2023-01-01T00:00:00.000Z'
  })
  @Expose()
  updatedAt: Date;
} 
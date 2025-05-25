import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class ReqCreateSupplierDto {
  @ApiProperty()
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi ký tự' })
  @Length(2, 100, {
    message: 'Tên nhà cung cấp phải có độ dài từ 2 đến 100 ký tự'
  })
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại không hợp lệ (ví dụ: +84...)'
  })
  phoneNumber?: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @Length(0, 255, {
    message: 'Địa chỉ không được vượt quá 255 ký tự'
  })
  address?: string;
  toParamsCreateSupplier() {
    return {
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      address: this.address
    };
  }
  toUpdateSupplier(id: string) {
    return {
      id,
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      address: this.address,
      isDeleted: false
    };
  }
}

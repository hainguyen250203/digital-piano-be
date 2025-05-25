import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ReqChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'Mật khẩu cũ của người dùng' })
  @IsString({ message: 'Mật khẩu cũ là bắt buộc và phải là chuỗi ký tự' })
  oldPassword: string;

  @ApiProperty({ example: 'newPassword123', description: 'Mật khẩu mới' })
  @IsString({ message: 'Mật khẩu mới là bắt buộc và phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: 'Mật khẩu mới phải bao gồm ít nhất 1 chữ cái và 1 số'
  })
  newPassword: string;
}

import { ProfileChangePasswordParams } from '@/Profile/queries/dto/profile-change-password.params';
import { ProfileQuery } from '@/Profile/queries/profile.query';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileChangePasswordAction {
  private readonly logger = new Logger(ProfileChangePasswordAction.name);
  constructor(private readonly profileQuery: ProfileQuery) {}
  
  async execute(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.profileQuery.getUserById(userId);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Mật khẩu cũ không đúng');
    
    if (oldPassword === newPassword) throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu cũ');
    
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const profileChangePasswordParams: ProfileChangePasswordParams = { userId, password: hashedPassword };
      await this.profileQuery.updateUserPassword(profileChangePasswordParams);
      return true;
    } catch (error) {
      this.logger.error('Error updating password:', error);
      throw new InternalServerErrorException('Không thể cập nhật mật khẩu. Vui lòng thử lại sau.');
    }
  }
} 
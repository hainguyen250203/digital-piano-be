import { UpdateProfileParams } from '@/Profile/queries/dto/update-profile.params';
import { ProfileQuery } from '@/Profile/queries/profile.query';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProfileUpdateProfileAction {
  constructor(private readonly profileQuery: ProfileQuery) {}

  async execute(updateProfileParams: UpdateProfileParams) {
    const user = await this.profileQuery.getUserById(updateProfileParams.userId);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    if (updateProfileParams.phoneNumber) {
      const userWithSamePhone = await this.profileQuery.getUserByPhoneNumber(updateProfileParams.phoneNumber);
      if (userWithSamePhone && userWithSamePhone.id !== user.id) throw new BadRequestException('Số điện thoại đã được sử dụng bởi một tài khoản khác');
    }
    const updatedUser = await this.profileQuery.updateUser(updateProfileParams);
    return updatedUser;
  }
} 
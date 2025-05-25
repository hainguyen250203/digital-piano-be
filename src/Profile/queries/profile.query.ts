import { PrismaService } from '@/Prisma/prisma.service';
import { ProfileChangePasswordParams } from '@/Profile/queries/dto/profile-change-password.params';
import { UpdateProfileParams } from '@/Profile/queries/dto/update-profile.params';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileQuery {
  constructor(private readonly prisma: PrismaService) {}
  
  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  
  async updateUser(updateProfileParams: UpdateProfileParams) {
    const { userId, ...data } = updateProfileParams;
    return this.prisma.user.update({ where: { id: userId }, data });
  }
  
  async getUserByPhoneNumber(phoneNumber: string) {
    return this.prisma.user.findUnique({ where: { phoneNumber } });
  }

  async updateUserPassword(profileChangePasswordParams: ProfileChangePasswordParams) {
    const { userId, password } = profileChangePasswordParams;
    return this.prisma.user.update({
      where: { id: userId },
      data: { password }
    });
  }
} 
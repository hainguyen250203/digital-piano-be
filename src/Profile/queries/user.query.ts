import { PrismaService } from '@/Prisma/prisma.service';
import { UpdateUserProfileParams } from '@/Profile/queries/dto/update-user-profile.params';
import { UserChangePasswordParams } from '@/Profile/queries/dto/user-change-password.params';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserQuery {
  constructor(private readonly prisma: PrismaService) {}
  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async updateUser(updateUserProfileParams: UpdateUserProfileParams) {
    const { userId, ...data } = updateUserProfileParams;
    return this.prisma.user.update({ where: { id: userId }, data });
  }
  async getUserByPhoneNumber(phoneNumber: string) {
    return this.prisma.user.findUnique({ where: { phoneNumber } });
  }

  async updateUserPassword(userChangePasswordParams: UserChangePasswordParams) {
    const { userId, password } = userChangePasswordParams;
    return this.prisma.user.update({
      where: { id: userId },
      data: { password }
    });
  }
}

import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class AuthQuery {
  constructor(private readonly prisma: PrismaService) { }
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(email: string, password: string, phoneNumber?: string) {
    return this.prisma.user.create({ data: { email, password, role: Role.customer, phoneNumber } });
  }

  async createOtp(email: string, otp: number, secret: string) {
    return this.prisma.user.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpiredAt: new Date(Date.now() + 5 * 60 * 1000),
        count: 1,
        otpSecret: secret
      }
    });
  }

  async getOtpByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        otpCode: true,
        otpExpiredAt: true,
        count: true,
        otpSecret: true
      }
    });
  }

  async updateCount(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: { count: { increment: 1 } }
    });
  }

  async updatePasswordAndResetOtp(email: string, password: string) {
    return this.prisma.user.update({
      where: { email },
      data: {
        password,
        otpCode: null,
        otpExpiredAt: null,
        count: null,
        otpSecret: null
      }
    });
  }

  async resetOtp(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: {
        otpCode: null,
        otpExpiredAt: null,
        count: null,
        otpSecret: null
      }
    });
  }

  async checkAdmin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });
    return user?.role === Role.admin ? user : null;
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }
}

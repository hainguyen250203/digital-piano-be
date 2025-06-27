import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthQuery } from '../queries/auth.query';
@Injectable()
export class VerifyOtpAction {
  constructor(
    private readonly authQuery: AuthQuery,
    private readonly jwtService: JwtService
  ) { }
  async execute(email: string, otp: string, secret: string, newPassword: string) {
    const user = await this.authQuery.getUserByEmail(email);
    if (!user) throw new NotFoundException('không tìm thấy người dùng');
    const otpRecord = await this.authQuery.getOtpByEmail(email);
    if (!otpRecord || otpRecord.otpCode == null || otpRecord.otpExpiredAt == null || otpRecord.count == null || otpRecord.otpSecret == null) {
      throw new BadRequestException('Không tìm thấy mã OTP, vui lòng thử lại');
    }

    if (otpRecord.otpSecret !== secret) {
      throw new BadRequestException('Mã xác minh không hợp lệ');
    }

    if (otpRecord.count >= 5) {
      await this.authQuery.resetOtp(email);
      throw new BadRequestException('Bạn đã nhập sai OTP quá nhiều lần, vui lòng thử lại sau');
    }

    if (otpRecord.otpCode !== Number(otp)) {
      await this.authQuery.updateCount(email);
      throw new BadRequestException('Mã OTP không chính xác');
    }

    if (otpRecord.otpExpiredAt < new Date()) {
      await this.authQuery.resetOtp(email);
      throw new BadRequestException('Mã OTP đã hết hạn, vui lòng thử lại');
    }
    await this.authQuery.resetOtp(email);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.authQuery.updatePasswordAndResetOtp(email, hashedPassword);
    const payload = { sub: updatedUser.id, email: updatedUser.email, role: updatedUser.role };
    return {
      accessToken: this.jwtService.sign(payload),
      role: user.role
    };
  }
}

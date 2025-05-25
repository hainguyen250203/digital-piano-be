import { AuthQuery } from '@/Auth/queries/auth.query';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginOtpAction {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authQuery: AuthQuery
  ) { }

  async execute(email: string, otp: string, otpSecret: string) {
    const user = await this.authQuery.getUserByEmail(email);
    if (!user) throw new NotFoundException('Email không tồn tại');

    // Check if user is blocked
    if (user.isBlock) {
      throw new ForbiddenException('Tài khoản đã bị chặn, vui lòng liên hệ với admin');
    }

    const otpRecord = await this.authQuery.getOtpByEmail(email);
    if (!otpRecord || otpRecord.otpCode == null || otpRecord.otpExpiredAt == null || otpRecord.count == null || otpRecord.otpSecret == null) {
      throw new BadRequestException('Không tìm thấy mã OTP, vui lòng thử lại');
    }

    if (otpRecord.otpSecret !== otpSecret) {
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
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      role: user.role
    };
  }
}

import { AuthQuery } from '@/Auth/queries/auth.query';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';

export type OtpType = 'login' | 'forgot-password'

@Injectable()
export class SendOtpAction {
  private readonly logger = new Logger(SendOtpAction.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly authQuery: AuthQuery
  ) { }

  async execute(email: string, type: OtpType) {
    const user = await this.authQuery.getUserByEmail(email);
    if (!user) throw new NotFoundException('User không tồn tại');

    const otp = this.generateOtp();
    const secret = randomBytes(16).toString('hex');
    await this.authQuery.createOtp(email, Number(otp), secret);

    const baseUrl = 'https://digital-piano.vercel.app';
    const link = type === 'login'
      ? `${baseUrl}/login/verify?email=${encodeURIComponent(email)}&otpSecret=${secret}`
      : `${baseUrl}/reset-password?email=${encodeURIComponent(email)}&otpSecret=${secret}&otp=${otp}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: type === 'login' ? 'Mã đăng nhập HĐ Music' : 'Khôi phục mật khẩu - HĐ Music',
        template: 'otp-email',
        context: {
          otpCode: otp,
          actionUrl: link,
          type
        }
      });

      return {
        otpSecret: secret
      };
    } catch (error) {
      this.logger.error(`Gửi OTP thất bại đến ${email}`, error);
      throw new BadRequestException('Không thể gửi OTP đến email');
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

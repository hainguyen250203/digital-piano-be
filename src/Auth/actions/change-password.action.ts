import { AuthQuery } from '@/Auth/queries/auth.query';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangePasswordAction {
  constructor(
    private readonly authQuery: AuthQuery,
    private readonly jwtService: JwtService
  ) { }

  async execute(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.authQuery.getUserById(userId);
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.authQuery.updatePassword(userId, hashedPassword);

    // Generate new token
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      role: user.role
    };
  }
} 
import { AuthQuery } from '@/Auth/queries/auth.query';
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class LoginAction {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authQuery: AuthQuery
  ) { }

  async execute(email: string, password: string) {
    const user = await this.authQuery.getUserByEmail(email);
    if (!user) throw new NotFoundException('email không tồn tại');
    
    // Check if user is blocked
    if (user.isBlock) {
      throw new ForbiddenException('Tài khoản đã bị chặn, vui lòng liên hệ với admin');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Mật khẩu không đúng');
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      role: user.role
    };
  }
}

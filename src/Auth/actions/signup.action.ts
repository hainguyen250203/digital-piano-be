import { AuthQuery } from '@/Auth/queries/auth.query';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SignUpAction {
  constructor(
    private readonly authQuery: AuthQuery,
    private readonly jwtService: JwtService
  ) {}

  async execute(email: string, password: string, phoneNumber?: string) {
    const existingEmailUser = await this.authQuery.getUserByEmail(email);
    if (existingEmailUser) throw new BadRequestException('Email đã được sử dụng');
    const hash = await bcrypt.hash(password, 10);
    try {
      const user = await this.authQuery.createUser(email, hash, phoneNumber);
      const payload = { sub: user.id, email: user.email, role: user.role };
      return {
        accessToken: this.jwtService.sign(payload),
        role: user.role
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('số điện thoại đã liên kết với tài khoản khác');
      }
      throw new BadRequestException('Đã xảy ra lỗi trong quá trình tạo tài khoản');
    }
  }
}

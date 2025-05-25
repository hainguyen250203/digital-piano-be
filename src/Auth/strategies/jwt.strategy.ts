import { AuthQuery } from '@/Auth/queries/auth.query';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authQuery: AuthQuery
  ) {
    const jwtOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.secret'),
    };
    super(jwtOptions);
  }

  async validate(payload: any) {
    // Check if user is blocked
    const user = await this.authQuery.getUserByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    
    if (user.isBlock) {
      throw new ForbiddenException('Tài khoản đã bị chặn, vui lòng liên hệ với admin');
    }
    
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}

import { LoginOtpAction } from '@/Auth/actions/login-otp.action';
import { LoginAction } from '@/Auth/actions/login.action';
import { SendOtpAction } from '@/Auth/actions/send-otp.action';
import { SignUpAction } from '@/Auth/actions/signup.action';
import { VerifyOtpAction } from '@/Auth/actions/verify-otp-action';
import { AuthController } from '@/Auth/api/auth.controller';
import { AuthQuery } from '@/Auth/queries/auth.query';
import { JwtStrategy } from '@/Auth/strategies/jwt.strategy';
import { PrismaModule } from '@/Prisma/prisma.module';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule.registerAsync({ imports: [ConfigModule], useFactory: async (config: ConfigService) => ({ secret: config.get('jwt.secret'), signOptions: { expiresIn: config.get('jwt.expiresIn') } }), inject: [ConfigService] })],
  controllers: [AuthController],
  providers: [JwtStrategy, LoginAction, SignUpAction, AuthQuery, VerifyOtpAction, LoginOtpAction, SendOtpAction]
})
export class AuthModule {}

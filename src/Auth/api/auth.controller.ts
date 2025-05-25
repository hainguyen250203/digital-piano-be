import { LoginOtpAction } from '@/Auth/actions/login-otp.action';
import { LoginAction } from '@/Auth/actions/login.action';
import { SendOtpAction } from '@/Auth/actions/send-otp.action';
import { SignUpAction } from '@/Auth/actions/signup.action';
import { VerifyOtpAction } from '@/Auth/actions/verify-otp-action';
import { ReqOtpDto } from '@/Auth/api/dto/req-otp.dto';
import { ReqSignInDto } from '@/Auth/api/dto/req-sign-in.dto';
import { ReqSignUpDto } from '@/Auth/api/dto/req-sign-up.dto';
import { ReqVerifyOtpForgotPasswordDto } from '@/Auth/api/dto/req-verify-otp-forgot-password.dto';
import { ReqVerifyOtpLoginDto } from '@/Auth/api/dto/req-verify-otp-login.dto';
import { ResAccessTokenDto } from '@/Auth/api/dto/res-access-token.dto';
import { Public } from '@/Auth/decorators/public.decorator';
import { AuthQuery } from '@/Auth/queries/auth.query';

import { ResOtpForgotPasswordDto } from '@/Auth/api/dto/res-otp-forgot-password.dto';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

@ApiTags('Xác thực')
@Controller({
  path: 'auth',
  version: '1'
})

export class AuthController {
  constructor(
    private readonly signUpAction: SignUpAction,
    private readonly loginAction: LoginAction,
    private readonly verifyOtpAction: VerifyOtpAction,
    private readonly loginOtpAction: LoginOtpAction,
    private readonly sendOtpAction: SendOtpAction,
    private readonly authQuery: AuthQuery
  ) { }

  @Post('sign-up')
  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản bằng email và mật khẩu' })
  @ApiBody({ type: ReqSignUpDto })
  @ApiOkResponse({ type: ResAccessTokenDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async signup(@Body() reqSignUpDto: ReqSignUpDto): Promise<BaseResponseDto<any>> {
    const { email, password, phoneNumber } = reqSignUpDto;
    const data = await this.signUpAction.execute(email, password, phoneNumber);
    return new SuccessResponseDto('Tạo tài khoản thanh công', plainToInstance(ResAccessTokenDto, data, { excludeExtraneousValues: true }));
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Đăng nhập bằng email và mật khẩu' })
  @ApiBody({ type: ReqSignInDto })
  @ApiOkResponse({ type: ResAccessTokenDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async signin(@Body() reqSignInDto: ReqSignInDto): Promise<BaseResponseDto<any>> {
    const { email, password } = reqSignInDto;
    const data = await this.loginAction.execute(email, password);
    return new SuccessResponseDto('Đăng nhập thành công', plainToInstance(ResAccessTokenDto, data, { excludeExtraneousValues: true }));
  }

  @Post('login/request-otp')
  @Public()
  @ApiOperation({ summary: 'Yêu cầu mã OTP để đăng nhập' })
  @ApiBody({ type: ReqOtpDto })
  @ApiOkResponse({ type: BaseResponseDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async requestOtpLogin(@Body() reqOtpDto: ReqOtpDto): Promise<BaseResponseDto<any>> {
    const data = await this.sendOtpAction.execute(reqOtpDto.email, 'login');
    return new SuccessResponseDto('Gửi mã OTP thành công', data);
  }

  @Post('login/verify-otp')
  @Public()
  @ApiOperation({ summary: 'Xác thực OTP để đăng nhập' })
  @ApiBody({ type: ReqVerifyOtpLoginDto })
  @ApiOkResponse({ type: ResAccessTokenDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async loginWithOtp(@Body() reqVerifyOtpLoginDto: ReqVerifyOtpLoginDto): Promise<BaseResponseDto<any>> {
    const { email, otp, otpSecret } = reqVerifyOtpLoginDto;
    const data = await this.loginOtpAction.execute(email, otp, otpSecret);
    return new SuccessResponseDto('Đăng nhập thành công', plainToInstance(ResAccessTokenDto, data, { excludeExtraneousValues: true }));
  }

  @Post('forgot-password/request-otp')
  @Public()
  @ApiOperation({ summary: 'Yêu cầu mã OTP để đặt lại mật khẩu' })
  @ApiBody({ type: ReqOtpDto })
  @ApiOkResponse({ type: ResOtpForgotPasswordDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async requestOtp(@Body() reqOtpDto: ReqOtpDto): Promise<BaseResponseDto<ResOtpForgotPasswordDto>> {
    const data = await this.sendOtpAction.execute(reqOtpDto.email, 'forgot-password');
    return new SuccessResponseDto('Gửi mã OTP thành công', plainToInstance(ResOtpForgotPasswordDto, data, { excludeExtraneousValues: true }));
  }

  @Post('forgot-password/verify-otp')
  @Public()
  @ApiOperation({ summary: 'Xác thực OTP và đặt lại mật khẩu mới' })
  @ApiBody({ type: ReqVerifyOtpForgotPasswordDto })
  @ApiOkResponse({ type: ResAccessTokenDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async verifyOtp(@Body() reqVerifyOtpForgotPasswordDto: ReqVerifyOtpForgotPasswordDto): Promise<BaseResponseDto<any>> {
    const { email, otp, otpSecret, newPassword } = reqVerifyOtpForgotPasswordDto;
    const data = await this.verifyOtpAction.execute(email, otp, otpSecret, newPassword);
    return new SuccessResponseDto('Đặt lại mật khẩu thành công', plainToInstance(ResAccessTokenDto, data, { excludeExtraneousValues: true }));
  }
}

import { Roles } from '@/Auth/decorators/roles.decorator';
import { GetUser } from '@/Auth/decorators/user.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { ProfileChangePasswordAction } from '@/Profile/actions/profile-change-password.action';
import { ProfileUpdateProfileAction } from '@/Profile/actions/profile-update-profile.action';
import { ProfileUploadAvatarAction } from '@/Profile/actions/profile-upload-avatar.action';
import { ReqChangePasswordDto } from '@/Profile/api/dto/req-change-password.dto';
import { UpdateProfileDto } from '@/Profile/api/dto/req-update-profile.dto';
import { ResProfileDto } from '@/Profile/api/dto/res-profile.dto';
import { UpdateProfileParams } from '@/Profile/queries/dto/update-profile.params';
import { ProfileQuery } from '@/Profile/queries/profile.query';
import { Body, Controller, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@ApiTags('Hồ sơ người dùng')
@Controller({ version: '1', path: 'profile' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.staff, Role.customer)
export class ProfileController {
  constructor(
    private readonly profileQuery: ProfileQuery,
    private readonly profileUploadAvatarAction: ProfileUploadAvatarAction,
    private readonly profileUpdateProfileAction: ProfileUpdateProfileAction,
    private readonly profileChangePasswordAction: ProfileChangePasswordAction
  ) { }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResProfileDto, description: 'Thông tin hồ sơ người dùng hiện tại' })
  @ApiBadRequestResponse({ type: BaseResponseDto, description: 'Lỗi khi lấy thông tin hồ sơ người dùng' })
  @ApiBody({ description: 'Lấy thông tin chi tiết của hồ sơ người dùng hiện tại' })
  async getProfile(@GetUser('userId') userId: string): Promise<BaseResponseDto<ResProfileDto>> {
    const user = await this.profileQuery.getUserById(userId);
    return new SuccessResponseDto('Lấy thông tin hồ sơ người dùng thành công', plainToInstance(ResProfileDto, user, { excludeExtraneousValues: true }));
  }

  @Patch()
  @ApiBearerAuth()
  @ApiBody({ type: UpdateProfileDto, description: 'Thông tin cập nhật hồ sơ người dùng' })
  @ApiOkResponse({ type: ResProfileDto, description: 'Cập nhật thông tin hồ sơ người dùng thành công' })
  @ApiBadRequestResponse({ type: BaseResponseDto, description: 'Lỗi khi cập nhật hồ sơ người dùng' })
  async updateProfile(@GetUser('userId') userId: string, @Body() updateProfileDto: UpdateProfileDto): Promise<BaseResponseDto<ResProfileDto>> {
    const updateProfileParams: UpdateProfileParams = updateProfileDto.toParams(userId);
    const user = await this.profileUpdateProfileAction.execute(updateProfileParams);
    return new SuccessResponseDto('Cập nhật thông tin hồ sơ người dùng thành công', plainToInstance(ResProfileDto, user, { excludeExtraneousValues: true }));
  }

  @Post('avatar')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Tải lên ảnh đại diện người dùng',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh đại diện (jpg, png, webp)'
        }
      },
      required: ['file']
    }
  })
  @ApiOkResponse({ type: ResProfileDto, description: 'Tải ảnh đại diện thành công' })
  @ApiBadRequestResponse({ type: BaseResponseDto, description: 'Lỗi khi tải ảnh đại diện' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 1 * 1024 * 1024 } }))
  async uploadAvatar(@GetUser('userId') userId: string, @UploadedFile() file: Express.Multer.File): Promise<BaseResponseDto<any>> {
    const user = await this.profileUploadAvatarAction.execute(userId, file);
    return new SuccessResponseDto('Upload avatar thành công', plainToInstance(ResProfileDto, user, { excludeExtraneousValues: true }));
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiBody({ type: ReqChangePasswordDto, description: 'Đổi mật khẩu người dùng' })
  @ApiOkResponse({ description: 'Thay đổi mật khẩu thành công' })
  @ApiBadRequestResponse({ type: BaseResponseDto, description: 'Lỗi khi thay đổi mật khẩu' })
  async changePassword(@GetUser('userId') userId: string, @Body() reqChangePasswordDto: ReqChangePasswordDto): Promise<BaseResponseDto<any>> {
    const { oldPassword, newPassword } = reqChangePasswordDto;
    await this.profileChangePasswordAction.execute(userId, oldPassword, newPassword);
    return new SuccessResponseDto('Thay đổi mật khẩu thành công', null);
  }
} 
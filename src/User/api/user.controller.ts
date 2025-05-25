import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { GetQueryDto } from '@/Common/dto/get-query.dto';
import { ReqUpdateBlockStatusDto } from '@/User/api/dto/req-update-block-status.dto';
import { ReqUpdateRoleDto } from '@/User/api/dto/req-update-role.dto';
import { ResUserDto } from '@/User/api/dto/res-user.dto';
import { UserQuery } from '@/User/queries/user.query';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { plainToInstance } from 'class-transformer';

@ApiTags('Quản lý người dùng')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userQuery: UserQuery) { }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  @ApiOkResponse({ description: 'Lấy danh sách người dùng thành công', type: [ResUserDto] })
  @ApiBadRequestResponse({ description: 'Không tìm thấy người dùng', type: BaseResponseDto })
  @Roles(Role.staff, Role.admin)
  async getUsers(@Query() getQueryDto: GetQueryDto) {
    const { skip, take, sort } = getQueryDto;
    const data = await this.userQuery.getUsers(skip, take, sort);
    if (!data || data.length === 0) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }
    return new SuccessResponseDto(
      'Lấy danh sách người dùng thành công',
      plainToInstance(ResUserDto, data, { excludeExtraneousValues: true }),
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiOkResponse({ description: 'Lấy thông tin người dùng thành công', type: ResUserDto })
  @ApiBadRequestResponse({ description: 'Không tìm thấy người dùng', type: BaseResponseDto })
  async getUserById(@Param('id') id: string) {
    const data = await this.userQuery.getUserById(id);
    if (!data) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }
    return new SuccessResponseDto(
      'Lấy thông tin người dùng thành công',
      plainToInstance(ResUserDto, data, { excludeExtraneousValues: true }),
    );
  }

  @Patch(':id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật vai trò người dùng' })
  @ApiBody({ type: ReqUpdateRoleDto })
  @ApiOkResponse({ description: 'Cập nhật vai trò thành công', type: ResUserDto })
  @ApiBadRequestResponse({ description: 'Cập nhật vai trò thất bại hoặc không tìm thấy người dùng', type: BaseResponseDto })
  async updateUserRole(@Param('id') id: string, @Body() reqUpdateRoleDto: ReqUpdateRoleDto) {
    try {
      const user = await this.userQuery.getUserById(id);
      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }
      const { role } = reqUpdateRoleDto;
      const updatedUser = await this.userQuery.updateUserRole(id, role);
      return new SuccessResponseDto(
        'Cập nhật vai trò thành công',
        plainToInstance(ResUserDto, updatedUser, { excludeExtraneousValues: true }),
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('Cập nhật vai trò thất bại');
      }
      throw error;
    }
  }

  @Patch(':id/block')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chặn / Bỏ chặn người dùng' })
  @ApiBody({ type: ReqUpdateBlockStatusDto })
  @ApiOkResponse({ description: 'Cập nhật trạng thái chặn thành công', type: ResUserDto })
  @ApiBadRequestResponse({ description: 'Cập nhật trạng thái chặn thất bại hoặc không tìm thấy người dùng', type: BaseResponseDto })
  async updateUserBlockStatus(@Param('id') id: string, @Body() reqUpdateBlockStatusDto: ReqUpdateBlockStatusDto) {
    try {
      const user = await this.userQuery.getUserById(id);
      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }
      const { isBlock } = reqUpdateBlockStatusDto;
      const updatedUser = await this.userQuery.updateUserBlockStatus(id, isBlock);
      return new SuccessResponseDto(
        isBlock ? 'Chặn người dùng thành công' : 'Bỏ chặn người dùng thành công',
        plainToInstance(ResUserDto, updatedUser, { excludeExtraneousValues: true }),
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('Cập nhật trạng thái chặn thất bại');
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xoá người dùng theo ID' })
  @ApiOkResponse({ description: 'Xoá người dùng thành công', type: SuccessResponseDto })
  @ApiBadRequestResponse({ description: 'Xoá người dùng thất bại hoặc không tìm thấy người dùng', type: BaseResponseDto })
  async deleteUserById(@Param('id') id: string) {
    try {
      const user = await this.userQuery.getUserById(id);
      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }
      const data = await this.userQuery.deleteUser(id);
      return new SuccessResponseDto('Xoá người dùng thành công', data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('Xoá người dùng thất bại');
      }
      throw error;
    }
  }

  @Patch(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khôi phục người dùng theo ID' })
  @ApiOkResponse({ description: 'Khôi phục người dùng thành công', type: SuccessResponseDto })
  @ApiBadRequestResponse({ description: 'Khôi phục người dùng thất bại hoặc không tìm thấy người dùng', type: BaseResponseDto })
  async restoreUser(@Param('id') id: string) {
    try {
      const user = await this.userQuery.getUserById(id);
      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }

      const updatedUser = await this.userQuery.restoreUser(id);
      return new SuccessResponseDto('Khôi phục người dùng thành công', updatedUser);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('Khôi phục người dùng thất bại');
      }
      throw error;
    }
  }
}

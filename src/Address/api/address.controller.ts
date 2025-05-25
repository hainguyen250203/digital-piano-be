import { CreateAddressAction } from '@/Address/action/create-address.action';
import { ReqCreateAddressDto } from '@/Address/api/dto/req-create-address.dto';
import { ReqUpdateAddressDto } from '@/Address/api/dto/req-update-address.dto';
import { ResAddressDto } from '@/Address/api/dto/res-address.dto';
import { AddressQuery } from '@/Address/queries/address.query';
import { GetUser } from '@/Auth/decorators/user.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

@ApiTags('Địa chỉ')
@Controller({
  path: 'addresses',
  version: '1'
})
export class AddressController {
  constructor(
    private readonly createAddressAction: CreateAddressAction,
    private readonly addressQuery: AddressQuery
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo địa chỉ mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo địa chỉ thành công',
    type: SuccessResponseDto
  })
  async createAddress(
    @Body() body: ReqCreateAddressDto,
    @GetUser('userId') userId: string,
  ): Promise<BaseResponseDto<ResAddressDto>> {
    const address = await this.createAddressAction.execute({
      userId: userId,
      fullName: body.fullName,
      phone: body.phone,
      street: body.street,
      ward: body.ward,
      district: body.district,
      city: body.city,
      isDefault: body.isDefault || false
    });

    return new SuccessResponseDto('Tạo địa chỉ thành công', plainToInstance(ResAddressDto, address, { excludeExtraneousValues: true }));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy tất cả địa chỉ của người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách địa chỉ thành công',
    type: SuccessResponseDto
  })
  async getAllAddresses(
    @GetUser('userId') userId: string
  ): Promise<BaseResponseDto<ResAddressDto[]>> {
    const addresses = await this.addressQuery.findAll({
      userId: userId
    });

    const addressDtos = addresses.map(address => plainToInstance(ResAddressDto, address, { excludeExtraneousValues: true }));

    return new SuccessResponseDto('Lấy danh sách địa chỉ thành công', addressDtos);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy địa chỉ theo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Lấy địa chỉ thành công',
    type: SuccessResponseDto
  })
  async getAddressById(
    @Param('id') id: string,
    @GetUser('userId') userId: string
  ): Promise<BaseResponseDto<ResAddressDto>> {
    const address = await this.addressQuery.findById(id);

    if (!address || address.userId !== userId) {
      throw new UnauthorizedException('Bạn không có quyền truy cập địa chỉ này');
    }

    return new SuccessResponseDto('Lấy địa chỉ thành công', plainToInstance(ResAddressDto, address, { excludeExtraneousValues: true }));
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật địa chỉ' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật địa chỉ thành công',
    type: SuccessResponseDto
  })
  async updateAddress(
    @Body() body: ReqUpdateAddressDto,
    @Param('id') id: string,
    @GetUser('userId') userId: string
  ): Promise<BaseResponseDto<ResAddressDto>> {
    const existingAddress = await this.addressQuery.findById(id);
    if (!existingAddress || existingAddress.userId !== userId) {
      throw new UnauthorizedException('Bạn không có quyền cập nhật địa chỉ này');
    }

    const updatedAddress = await this.addressQuery.update({
      id,
      userId: userId,
      fullName: body.fullName,
      phone: body.phone,
      street: body.street,
      ward: body.ward,
      district: body.district,
      city: body.city,
      isDefault: body.isDefault
    });

    return new SuccessResponseDto('Cập nhật địa chỉ thành công', plainToInstance(ResAddressDto, updatedAddress, { excludeExtraneousValues: true }));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa địa chỉ' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Xóa địa chỉ thành công',
    type: SuccessResponseDto
  })
  async deleteAddress(
    @Param('id') id: string,
    @GetUser('userId') userId: string
  ): Promise<BaseResponseDto<null>> {
    const existingAddress = await this.addressQuery.findById(id);
    if (!existingAddress || existingAddress.userId !== userId) {
      throw new UnauthorizedException('Bạn không có quyền xóa địa chỉ này');
    }

    await this.addressQuery.delete(id);

    return new SuccessResponseDto('Xóa địa chỉ thành công', null);
  }

  @Patch(':id/default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đặt địa chỉ làm mặc định' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Đặt địa chỉ mặc định thành công',
    type: SuccessResponseDto
  })
  async setAddressAsDefault(
    @Param('id') id: string,
    @GetUser('userId') userId: string
  ): Promise<BaseResponseDto<ResAddressDto>> {
    // Check if address belongs to the user
    const existingAddress = await this.addressQuery.findById(id);
    if (!existingAddress || existingAddress.userId !== userId) {
      throw new UnauthorizedException('Bạn không có quyền cập nhật địa chỉ này');
    }

    const updatedAddress = await this.addressQuery.setAsDefault(id, userId);

    return new SuccessResponseDto('Đặt địa chỉ mặc định thành công', plainToInstance(ResAddressDto, updatedAddress, { excludeExtraneousValues: true }));
  }

} 
import { Public } from '@/Auth/decorators/public.decorator';
import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { ReqCreateSupplierDto } from '@/Supplier/api/dto/req-create-supplier.dto';
import { ReqUpdateSupplierDto } from '@/Supplier/api/dto/req-update-supplier.dto';
import { ResSupplierDto } from '@/Supplier/api/dto/res-supplier.dto';
import { updateSupplierParams } from '@/Supplier/queries/dto/update-supplier.params';
import { SupplierQuery } from '@/Supplier/queries/supplier.query';
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { plainToInstance } from 'class-transformer';

@ApiTags('Nhà cung cấp')
@UseGuards(JwtAuthGuard)
@Roles(Role.admin)
@Controller({ path: 'supplier', version: '1' })
export class SupplierController {
  constructor(private readonly supplierQuery: SupplierQuery) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo nhà cung cấp mới' })
  @ApiBody({ type: ReqCreateSupplierDto })
  @ApiOkResponse({ description: 'Nhà cung cấp đã được tạo', type: ResSupplierDto })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ', type: BaseResponseDto })
  async create(@Body() createSupplierParams: ReqCreateSupplierDto): Promise<BaseResponseDto<ResSupplierDto>> {
    try {
      const data = await this.supplierQuery.create(createSupplierParams);
      return new SuccessResponseDto(
        'Tạo nhà cung cấp thành công',
        plainToInstance(ResSupplierDto, data, { excludeExtraneousValues: true })
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Nhà cung cấp đã tồn tại trong hệ thống');
      }
      throw error;
    }
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách tất cả nhà cung cấp' })
  @ApiOkResponse({ description: 'Danh sách nhà cung cấp', type: [ResSupplierDto] })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ', type: BaseResponseDto })
  async getAll(): Promise<BaseResponseDto<ResSupplierDto[]>> {
    const data = await this.supplierQuery.findAll();
    return new SuccessResponseDto(
      'Lấy danh sách nhà cung cấp thành công',
      plainToInstance(ResSupplierDto, data, { excludeExtraneousValues: true })
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy thông tin nhà cung cấp theo ID' })
  @ApiParam({ name: 'id', description: 'ID nhà cung cấp' })
  @ApiOkResponse({ description: 'Thông tin nhà cung cấp', type: ResSupplierDto })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ', type: BaseResponseDto })
  async getSupplierById(@Param('id') id: string): Promise<BaseResponseDto<ResSupplierDto>> {
    const data = await this.supplierQuery.findOne(id);
    return new SuccessResponseDto(
      'Lấy thông tin nhà cung cấp thành công',
      plainToInstance(ResSupplierDto, data, { excludeExtraneousValues: true })
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin nhà cung cấp' })
  @ApiParam({ name: 'id', description: 'ID nhà cung cấp' })
  @ApiBody({ type: ReqUpdateSupplierDto })
  @ApiOkResponse({ description: 'Nhà cung cấp đã được cập nhật', type: ResSupplierDto })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ', type: BaseResponseDto })
  async updateSupplier(@Param('id') id: string, @Body() reqUpdateSupplierDto: ReqUpdateSupplierDto): Promise<BaseResponseDto<ResSupplierDto>> {
    try {
      const updateSupplierParams: updateSupplierParams = reqUpdateSupplierDto.toUpdateSupplier(id);
      const data = await this.supplierQuery.update(updateSupplierParams);
      return new SuccessResponseDto(
        'Cập nhật nhà cung cấp thành công',
        plainToInstance(ResSupplierDto, data, { excludeExtraneousValues: true })
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Nhà cung cấp đã tồn tại trong hệ thống');
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa nhà cung cấp' })
  @ApiParam({ name: 'id', description: 'ID nhà cung cấp' })
  @ApiOkResponse({ description: 'Nhà cung cấp đã được xóa', type: ResSupplierDto })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ', type: BaseResponseDto })
  async deleteSupplier(@Param('id') id: string): Promise<BaseResponseDto<ResSupplierDto>> {
    const data = await this.supplierQuery.delete(id);
    return new SuccessResponseDto(
      'Xóa nhà cung cấp thành công',
      plainToInstance(ResSupplierDto, data, { excludeExtraneousValues: true })
    );
  }
}

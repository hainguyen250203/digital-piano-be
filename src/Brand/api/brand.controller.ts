import { Public } from '@/Auth/decorators/public.decorator';
import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { ReqCreateBrandDto } from '@/Brand/api/dto/req-create-brand.dto';
import { ReqUpdateBrandDto } from '@/Brand/api/dto/req-update-brand.dto';
import { ResBrandDto } from '@/Brand/api/dto/res-brand.dto';
import { BrandQuery } from '@/Brand/queries/brand.query';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { GetQueryDto } from '@/Common/dto/get-query.dto';
import { ResProductByCollectionDto } from '@/Product/api/dto/res-product-by-collection.dto';
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { plainToInstance } from 'class-transformer';

@ApiTags('Thương Hiệu')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller({ path: 'brand', version: '1' })
export class BrandController {
  constructor(private readonly brandQuery: BrandQuery) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo thương hiệu mới' })
  @ApiBody({ type: ReqCreateBrandDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async createbrand(@Body() reqCreateBrandDto: ReqCreateBrandDto) {
    try {
      return new SuccessResponseDto('Tạo thương hiệu thành công', await this.brandQuery.createBrand(reqCreateBrandDto.name));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('Thương hiệu đã tồn tại');
      throw error;
    }
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả thương hiệu' })
  @ApiOkResponse({ type: [ReqCreateBrandDto] })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async getCategories(@Query() getQueryDto: GetQueryDto) {
    const { skip, take, sort } = getQueryDto;
    const data = await this.brandQuery.getBrands(skip, take, sort);
    if (!data) throw new BadRequestException('Không tìm thấy thương hiệu nào');
    return new SuccessResponseDto('Lấy danh sách thương hiệu thành công', plainToInstance(ResBrandDto, data, { excludeExtraneousValues: true }));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết thương hiệu' })
  @ApiOkResponse({ type: ReqCreateBrandDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async getbrandById(@Param('id') id: string) {
    const data = await this.brandQuery.getBrandById(id);
    if (!data) throw new BadRequestException('Không tìm thấy thương hiệu');
    return new SuccessResponseDto('Lấy thông tin thương hiệu thành công', plainToInstance(ResBrandDto, data, { excludeExtraneousValues: true }));
  }

  @Public()
  @Get(':id/products')
  @ApiOkResponse({ type: ResProductByCollectionDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm theo thương hiệu' })
  async getProductsByBrandId(@Param('id') id: string, @Query() getQueryDto: GetQueryDto) {
    const { skip, take, sort } = getQueryDto;
    const result = await this.brandQuery.getProductsByBrandId(id, skip, take, sort);
    return new SuccessResponseDto('Lấy danh sách sản phẩm theo thương hiệu thành công', plainToInstance(ResProductByCollectionDto, result, { excludeExtraneousValues: true }));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin thương hiệu' })
  @ApiBody({ type: ReqUpdateBrandDto })
  @ApiOkResponse({ type: ReqCreateBrandDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async updatebrandById(@Param('id') id: string, @Body() reqUpdateBrandDto: ReqUpdateBrandDto) {
    const { name, isDeleted } = reqUpdateBrandDto;
    try {
      const data = await this.brandQuery.getBrandById(id);
      if (!data) throw new BadRequestException('Không tìm thấy thương hiệu');
      const update = await this.brandQuery.updateBrandById(id, name, isDeleted);
      return new SuccessResponseDto('Cập nhật thương hiệu thành công', plainToInstance(ResBrandDto, update, { excludeExtraneousValues: true }));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Tên thương hiệu đã tồn tại');
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa thương hiệu theo ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async deletebrandById(@Param('id') id: string) {
    try {
      const data = await this.brandQuery.deleteBrandById(id);
      return new SuccessResponseDto('Xóa thương hiệu thành công', data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new BadRequestException('Không tìm thấy thương hiệu để xóa');
      }
      throw error;
    }
  }
}

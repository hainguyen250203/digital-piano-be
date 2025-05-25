import { Public } from '@/Auth/decorators/public.decorator';
import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { GetQueryDto } from '@/Common/dto/get-query.dto';
import { ReqCreateProductTypeDto } from '@/ProductType/api/dto/req-create-product-type.dto';
import { ReqUpdateProductTypeDto } from '@/ProductType/api/dto/req-update-product-type.dto';
import { ResProductByProductTypeDto } from '@/ProductType/api/dto/res-product-by-product-type.dto';
import { ResProductTypeDetailDto } from '@/ProductType/api/dto/res-product-type-detail.dto';
import { ResProductTypeDto } from '@/ProductType/api/dto/res-product-type.dto';
import { ProductTypeQuery } from '@/ProductType/queries/product-type.query';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

@ApiTags('Loại sản phẩm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller({ path: 'product-types', version: '1' })
export class ProductTypeController {
  constructor(private readonly productTypeQuery: ProductTypeQuery) { }

  @Post()
  @ApiBearerAuth()
  @ApiBody({ type: ReqCreateProductTypeDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Tạo loại sản phẩm mới' })
  async create(@Body() dto: ReqCreateProductTypeDto) {
    try {
      const result = await this.productTypeQuery.create(dto.toParams());
      return new SuccessResponseDto('Tạo loại sản phẩm thành công', plainToInstance(ResProductTypeDto, result, { excludeExtraneousValues: true }));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Loại sản phẩm đã tồn tại');
      }
      throw error;
    }
  }

  @Public()
  @Get()
  @ApiOkResponse({ type: [ResProductTypeDto] })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Lấy danh sách tất cả loại sản phẩm' })
  async findAll(@Query() getQueryDto: GetQueryDto) {
    const { skip, take, sort } = getQueryDto;
    const result = await this.productTypeQuery.findAll(skip, take, sort);
    return new SuccessResponseDto('Lấy tất cả loại sản phẩm thành công', plainToInstance(ResProductTypeDto, result, { excludeExtraneousValues: true }));
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: ResProductTypeDetailDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Lấy loại sản phẩm theo ID' })
  async findOne(@Param('id') id: string) {
    const result = await this.productTypeQuery.findOne(id);
    if (!result) throw new BadRequestException('Loại sản phẩm không tìm thấy');
    return new SuccessResponseDto('Lấy loại sản phẩm thành công', plainToInstance(ResProductTypeDetailDto, result, { excludeExtraneousValues: true }));
  }

  @Public()
  @Get(':id/products')
  @ApiOkResponse({ type: ResProductByProductTypeDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm theo loại sản phẩm' })
  async findProductsByProductTypeId(@Param('id') id: string) {
    const result = await this.productTypeQuery.getProductByProductType(id);
    return new SuccessResponseDto('Lấy danh sách sản phẩm theo loại sản phẩm thành công', plainToInstance(ResProductByProductTypeDto, result, { excludeExtraneousValues: true }));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiBody({ type: ReqUpdateProductTypeDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Cập nhật loại sản phẩm' })
  async updateProductTypeById(@Param('id') id: string, @Body() reqUpdateProductTypeDto: ReqUpdateProductTypeDto) {
    try {
      const result = await this.productTypeQuery.update(reqUpdateProductTypeDto.toUpdateProductTypeParams(id));
      return new SuccessResponseDto('Cập nhật loại sản phẩm thành công', plainToInstance(ResProductTypeDto, result, { excludeExtraneousValues: true }));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Loại sản phẩm không tồn tại');
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ResProductTypeDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Xóa loại sản phẩm' })
  async remove(@Param('id') id: string) {
    try {
      const result = await this.productTypeQuery.remove(id);
      return new SuccessResponseDto('Xóa loại sản phẩm thành công', plainToInstance(ResProductTypeDto, result, { excludeExtraneousValues: true }));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new BadRequestException('Loại sản phẩm không tìm thấy');
      }
      throw error;
    }
  }

  @Public()
  @Get('by-sub-category/:subCategoryId')
  @ApiOkResponse({ type: [ResProductTypeDto] })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Lấy danh sách loại sản phẩm theo danh mục con' })
  async getProductTypeBySubCategoryId(@Param('subCategoryId') subCategoryId: string) {
    const result = await this.productTypeQuery.getProductTypeBySubCategoryId(subCategoryId);
    return new SuccessResponseDto('Lấy danh sách loại sản phẩm theo danh mục con thành công', plainToInstance(ResProductTypeDto, result, { excludeExtraneousValues: true }));
  }
}

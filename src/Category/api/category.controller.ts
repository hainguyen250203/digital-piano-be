import { Public } from '@/Auth/decorators/public.decorator';
import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { ReqCreateCategoryDto } from '@/Category/api/dto/req-create-category.dto';
import { ReqUpdateCategoryDto } from '@/Category/api/dto/req-update-category.dto';
import { ResSubCategoryDto } from '@/Category/api/dto/res-category.dto';
import { ResMenuDto } from '@/Category/api/dto/res-menu.dto';
import { CategoryQuery } from '@/Category/queries/category.query';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { GetQueryDto } from '@/Common/dto/get-query.dto';
import { ResProductByCollectionDto } from '@/Product/api/dto/res-product-by-collection.dto';
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { plainToInstance } from 'class-transformer';

@ApiTags('Danh mục sản phẩm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller({ path: 'category', version: '1' })
export class CategoryController {
  constructor(private readonly categoryQuery: CategoryQuery) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo danh mục sản phẩm mới' })
  @ApiBody({ type: ReqCreateCategoryDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async createCategory(@Body() reqCreateCategoryDto: ReqCreateCategoryDto) {
    try {
      const data = await this.categoryQuery.createCategory(reqCreateCategoryDto.name);
      return new SuccessResponseDto('Tạo danh mục sản phẩm thành công', plainToInstance(ResSubCategoryDto, data, { excludeExtraneousValues: true }));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('Danh mục sản phẩm đã tồn tại');
      throw error;
    }
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục sản phẩm' })
  @ApiOkResponse({ type: [ResSubCategoryDto] })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async getCategories() {
    const data = await this.categoryQuery.getCategories();
    if (!data) throw new BadRequestException('Không tìm thấy danh mục sản phẩm');
    return new SuccessResponseDto('Lấy danh sách danh mục sản phẩm thành công', plainToInstance(ResSubCategoryDto, data, { excludeExtraneousValues: true }));
  }

  @Public()
  @Get('menu')
  @ApiOperation({ summary: 'Lấy danh sách menu' })
  @ApiOkResponse({ type: [ResMenuDto] })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async getMenu() {
    const data = await this.categoryQuery.getMenu();
    if (!data) throw new BadRequestException('Không tìm thấy menu');
    return new SuccessResponseDto('Lấy danh sách menu thành công', plainToInstance(ResMenuDto, data, { excludeExtraneousValues: true }));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục sản phẩm theo ID' })
  @ApiOkResponse({ type: ResSubCategoryDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async getCategoryById(@Param('id') id: string) {
    const data = await this.categoryQuery.getCategoryById(id);
    if (!data) throw new BadRequestException('Không tìm thấy danh mục sản phẩm');
    return new SuccessResponseDto('Lấy chi tiết danh mục sản phẩm thành công', plainToInstance(ResSubCategoryDto, data, { excludeExtraneousValues: true }));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật danh mục sản phẩm theo ID' })
  @ApiBody({ type: ReqCreateCategoryDto })
  @ApiOkResponse({ type: ResSubCategoryDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async updateCategoryById(@Param('id') id: string, @Body() ReqUpdateCategoryDto: ReqUpdateCategoryDto) {
    const { name, isDeleted } = ReqUpdateCategoryDto;
    try {
      const update = await this.categoryQuery.updateCategoryById(id, name, isDeleted);
      return new SuccessResponseDto('Cập nhật danh mục sản phẩm thành công', plainToInstance(ResSubCategoryDto, update, { excludeExtraneousValues: true }));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('Danh mục sản phẩm đã tồn tại');
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa danh mục sản phẩm theo ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async deleteCategoryById(@Param('id') id: string) {
    try {
      const data = await this.categoryQuery.deleteCategoryById(id);
      return new SuccessResponseDto('Xóa danh mục sản phẩm thành công', data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') throw new BadRequestException('Không tìm thấy danh mục sản phẩm');
      throw error;
    }
  }

  @Public()
  @Get(':id/products')
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm theo danh mục' })
  @ApiOkResponse({ type: ResProductByCollectionDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async getProductsByCategory(@Param('id') id: string, @Query() getQueryDto: GetQueryDto) {
    const { skip, take, sort } = getQueryDto;
    const data = await this.categoryQuery.getProductsByCategory(id, skip, take, sort);
    return new SuccessResponseDto(
      'Lấy danh sách sản phẩm theo danh mục thành công',
      plainToInstance(ResProductByCollectionDto, data, { excludeExtraneousValues: true })
    );
  }
}

import { Public } from '@/Auth/decorators/public.decorator';
import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { GetQueryDto } from '@/Common/dto/get-query.dto';
import { ReqCreateSubCategoryDto } from '@/SubCategory//api/dto/req-create-sub-category.dto';
import { ResSubCategoryDto } from '@/SubCategory//api/dto/res-sub-category.dto';
import { SubCategoryQuery } from '@/SubCategory//queries/sub-category.query';
import { ReqUpdateSubCategoryDto } from '@/SubCategory/api/dto/req-update-sub-category.dto';
import { ResProductBySubCategoryDto } from '@/SubCategory/api/dto/res-product-by-subCategory';
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { plainToInstance } from 'class-transformer';

@ApiTags('Danh Mục Phụ')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller({ path: '/sub-category', version: '1' })
export class SubCategoryController {
  constructor(private readonly subCategoryQuery: SubCategoryQuery) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo danh mục phụ' })
  @ApiBody({ type: ReqCreateSubCategoryDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async createSubCategory(@Body() dto: ReqCreateSubCategoryDto) {
    try {
      const result = await this.subCategoryQuery.create(dto.name, dto.categoryId);
      return new SuccessResponseDto('Tạo danh mục phụ thành công', plainToInstance(ResSubCategoryDto, result, { excludeExtraneousValues: true }));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('Danh mục phụ đã tồn tại');
      throw error;
    }
  }

  @Public()
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục phụ' })
  @ApiOkResponse({ type: [ResSubCategoryDto] })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async getSubCategories(@Query() getQueryDto: GetQueryDto) {
    const result = await this.subCategoryQuery.findAll(getQueryDto.skip, getQueryDto.take);
    return new SuccessResponseDto('Lấy danh mục phụ thành công', plainToInstance(ResSubCategoryDto, result, { excludeExtraneousValues: true }));
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: ResSubCategoryDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Lấy thông tin chi tiết danh mục phụ' })
  async getSubCategoryById(@Param('id') id: string) {
    const result = await this.subCategoryQuery.findOne(id);
    if (!result) throw new BadRequestException('Danh mục phụ không tìm thấy');
    return new SuccessResponseDto('Lấy danh mục phụ thành công', result);
  }

  @Public()
  @Get(':id/products')
  @ApiOkResponse({ type: ResProductBySubCategoryDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Lấy thông tin chi tiết danh mục phụ' })
  async getProductsBySubCategoryId(@Param('id') id: string, @Query() getQueryDto: GetQueryDto) {
    // Calculate skip and take for pagination
    const skip = getQueryDto.skip;
    const take = getQueryDto.take;
    const result = await this.subCategoryQuery.findAllProductsBySubCategoryId(
      id,
      skip,
      take,
      getQueryDto.sort
    );

    // Return empty array if no products found, instead of throwing an error
    return new SuccessResponseDto('Lấy sản phẩm theo danh mục phụ thành công', plainToInstance(ResProductBySubCategoryDto, result, { excludeExtraneousValues: true }));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật danh mục phụ' })
  @ApiBody({ type: ReqUpdateSubCategoryDto })
  @ApiOkResponse({ type: ResSubCategoryDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async updateSubCategoryById(@Param('id') id: string, @Body() reqUpdateSubCategoryDto: ReqUpdateSubCategoryDto) {
    try {
      const { name, categoryId, isDeleted } = reqUpdateSubCategoryDto;
      const result = await this.subCategoryQuery.update(id, name, categoryId, isDeleted);
      return new SuccessResponseDto('Cập nhật danh mục phụ thành công', result);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('Danh mục phụ đã tồn tại');
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa danh mục phụ theo ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  async deleteSubCategoryById(@Param('id') id: string) {
    try {
      const result = await this.subCategoryQuery.remove(id);
      return new SuccessResponseDto('Xóa danh mục phụ thành công', result);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') throw new BadRequestException('Danh mục phụ không tìm thấy');
      throw error;
    }
  }

  @Public()
  @Get('by-category/:categoryId')
  @ApiOkResponse({ type: [ResSubCategoryDto] })
  @ApiBadRequestResponse({ type: BaseResponseDto })
  @ApiOperation({ summary: 'Lấy danh sách danh mục phụ theo danh mục chính' })
  async getSubCategoryByCategoryId(@Param('categoryId') categoryId: string) {
    const result = await this.subCategoryQuery.getSubCategoryByCategoryId(categoryId);
    return new SuccessResponseDto('Lấy danh sách danh mục phụ theo danh mục chính thành công', plainToInstance(ResSubCategoryDto, result, { excludeExtraneousValues: true }));
  }

}

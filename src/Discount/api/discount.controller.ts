import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { GetDiscountByCodeAction } from '@/Discount/action/get-discount-by-code.action';
import {
  CreateDiscountDto,
  DiscountResponseDto,
  GetDiscountParamsDto,
  UpdateDiscountDto
} from '@/Discount/api/dto/discount.dto';
import { DiscountQuery } from '@/Discount/queries/discount.query';
import { DiscountValidationResultDto, ValidateDiscountDto } from '@/Discount/queries/dto/discount.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@ApiTags('Mã giảm giá')
@Controller({
  path: 'discounts',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscountController {
  constructor(private readonly discountQuery: DiscountQuery, private readonly getDiscountByCodeAction: GetDiscountByCodeAction) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mã giảm giá' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mục mỗi trang' })
  @ApiOkResponse({ type: DiscountResponseDto })
  @Roles(Role.admin, Role.staff)
  @ApiBearerAuth()
  async getAllDiscounts(@Query() params: GetDiscountParamsDto) {
    const result = await this.discountQuery.getAllDiscounts(params);
    return new SuccessResponseDto('Lấy danh sách mã giảm giá thành công', plainToInstance(DiscountResponseDto, result));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết mã giảm giá theo ID' })
  @ApiParam({ name: 'id', description: 'ID của mã giảm giá' })
  @ApiOkResponse({ type: DiscountResponseDto })
  @Roles(Role.admin, Role.staff)
  @ApiBearerAuth()
  async getDiscount(@Param('id') id: string): Promise<DiscountResponseDto> {
    const discount = await this.discountQuery.getDiscountById(id);

    if (!discount) {
      throw new NotFoundException('Không tìm thấy mã giảm giá');
    }

    return plainToInstance(DiscountResponseDto, discount);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Lấy chi tiết mã giảm giá theo mã' })
  @ApiParam({ name: 'code', description: 'Mã của mã giảm giá' })
  @ApiOkResponse({ type: DiscountResponseDto })
  @ApiBearerAuth()
  async getDiscountByCode(@Param('code') code: string): Promise<SuccessResponseDto<DiscountResponseDto>> {
    const discount = await this.getDiscountByCodeAction.execute(code);
    return new SuccessResponseDto('Lấy chi tiết mã giảm giá thành công', plainToInstance(DiscountResponseDto, discount));
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới mã giảm giá' })
  @ApiCreatedResponse({ type: DiscountResponseDto })
  @Roles(Role.admin)
  @ApiBearerAuth()
  async createDiscount(@Body() dto: CreateDiscountDto): Promise<BaseResponseDto<DiscountResponseDto>> {
    try {
      const result = await this.discountQuery.createDiscount(dto);
      return new SuccessResponseDto('Tạo mã giảm giá thành công', plainToInstance(DiscountResponseDto, result));
    } catch (error) {
      throw new BadRequestException('Tạo mã giảm giá thất bại: ' + error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật mã giảm giá' })
  @ApiParam({ name: 'id', description: 'ID của mã giảm giá' })
  @ApiOkResponse({ type: DiscountResponseDto })
  @Roles(Role.admin)
  @ApiBearerAuth()
  async updateDiscount(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto
  ): Promise<SuccessResponseDto<DiscountResponseDto>> {
    const result = await this.discountQuery.updateDiscount(id, dto);

    if (!result) {
      throw new NotFoundException('Không tìm thấy mã giảm giá');
    }

    return new SuccessResponseDto('Cập nhật mã giảm giá thành công', plainToInstance(DiscountResponseDto, result));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mã giảm giá' })
  @ApiParam({ name: 'id', description: 'ID của mã giảm giá' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @Roles(Role.admin)
  @ApiBearerAuth()
  async deleteDiscount(@Param('id') id: string): Promise<SuccessResponseDto<null>> {
    const result = await this.discountQuery.deleteDiscount(id);

    if (!result) {
      throw new NotFoundException('Không tìm thấy mã giảm giá để xóa');
    }

    return new SuccessResponseDto('Xóa mã giảm giá thành công', null);
  }



  @Post('validate')
  @ApiOperation({ summary: 'Xác thực mã giảm giá' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @ApiBearerAuth()
  async validateDiscount(@Body() dto: ValidateDiscountDto): Promise<any> {
    const result = await this.discountQuery.validateDiscount(dto);
    return new SuccessResponseDto('Xác thực mã giảm giá thành công', plainToInstance(DiscountValidationResultDto, result));
  }

  @Post(':id/increment-usage')
  @ApiOperation({ summary: 'Tăng số lượt sử dụng của mã giảm giá' })
  @ApiParam({ name: 'id', description: 'ID của mã giảm giá' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @Roles(Role.admin, Role.staff)
  @ApiBearerAuth()
  async incrementUsage(@Param('id') id: string): Promise<SuccessResponseDto<null>> {
    await this.discountQuery.incrementUsageCount(id);

    return new SuccessResponseDto('Tăng lượt sử dụng mã giảm giá thành công', null);
  }
}

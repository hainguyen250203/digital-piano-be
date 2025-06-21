import { PrismaService } from '@/Prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDiscountDto, GetDiscountParamsDto, UpdateDiscountDto } from '../api/dto/discount.dto';
import {
  DiscountCreateDto,
  DiscountUpdateDto,
  DiscountValidationResultDto,
  ValidateDiscountDto
} from './dto/discount.dto';

@Injectable()
export class DiscountQuery {
  constructor(private prisma: PrismaService) { }


  async getAllDiscounts(params: GetDiscountParamsDto) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const data = await this.prisma.discount.findMany({
      skip,
      take: limit,
    });
    return data;
  }

  async getDiscountById(id: string) {
    return this.prisma.discount.findUnique({
      where: {
        id,
        isDeleted: false
      },
    });
  }

  async getDiscountByCode(code: string) {
    return await this.prisma.discount.findUnique({
      where: {
        code: code.toUpperCase(),
        isDeleted: false
      },
    });
  }

  private mapToDiscountCreateDto(dto: CreateDiscountDto): DiscountCreateDto {
    return {
      code: dto.code,
      description: dto.description,
      discountType: dto.discountType,
      value: dto.value,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      maxUses: dto.maxUses,
      minOrderTotal: dto.minOrderTotal,
      maxDiscountValue: dto.maxDiscountValue,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    };
  }

  async createDiscount(dto: CreateDiscountDto) {
    const discountCreateDto = this.mapToDiscountCreateDto(dto);

    // Check if code already exists
    const existingDiscount = await this.prisma.discount.findUnique({
      where: { code: discountCreateDto.code.toUpperCase() },
    });

    if (existingDiscount && !existingDiscount.isDeleted) {
      throw new Error(`Mã giảm giá ${discountCreateDto.code} đã tồn tại`);
    }

    // Create or recreate the discount
    if (existingDiscount && existingDiscount.isDeleted) {
      return this.prisma.discount.update({
        where: { id: existingDiscount.id },
        data: {
          ...discountCreateDto,
          code: discountCreateDto.code.toUpperCase(),
          isDeleted: false,
          usedCount: 0,
        },
      });
    } else {
      return this.prisma.discount.create({
        data: {
          ...discountCreateDto,
          code: discountCreateDto.code.toUpperCase(),
          usedCount: 0,
        },
      });
    }
  }

  private mapToDiscountUpdateDto(dto: UpdateDiscountDto): DiscountUpdateDto {
    return {
      code: dto.code?.toUpperCase(),
      description: dto.description,
      discountType: dto.discountType,
      value: dto.value,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      maxUses: dto.maxUses,
      minOrderTotal: dto.minOrderTotal,
      maxDiscountValue: dto.maxDiscountValue,
      isActive: dto.isActive,
      isDeleted: dto.isDeleted,
    };
  }

  async updateDiscount(id: string, dto: UpdateDiscountDto) {
    const discountUpdateDto = this.mapToDiscountUpdateDto(dto);
    // Check if discount exists
    return await this.prisma.discount.update({
      where: { id },
      data: {
        ...discountUpdateDto,
        code: discountUpdateDto.code?.toUpperCase(),
      },
    });
  }

  async deleteDiscount(id: string) {
    const existingDiscount = await this.prisma.discount.findUnique({
      where: { id },
    });

    if (!existingDiscount || existingDiscount.isDeleted) {
      return null;
    }

    return this.prisma.discount.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }

  async validateDiscount(dto: ValidateDiscountDto): Promise<DiscountValidationResultDto> {
    const { code, orderTotal } = dto;

    // Find the discount
    const discount = await this.prisma.discount.findUnique({
      where: {
        code: code.toUpperCase(),
        isDeleted: false,
      },
    });

    // Check if discount exists
    if (!discount) {
      return {
        isValid: false,
        message: 'Mã giảm giá không tồn tại'
      };
    }

    // Check if discount is active
    if (!discount.isActive) {
      return {
        isValid: false,
        message: 'Mã giảm giá không còn hiệu lực'
      };
    }

    // Check if discount is within valid date range
    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return {
        isValid: false,
        message: 'Mã giảm giá chưa có hiệu lực'
      };
    }

    if (discount.endDate && new Date(discount.endDate) < now) {
      return {
        isValid: false,
        message: 'Mã giảm giá đã hết hạn'
      };
    }

    // Check if discount has reached max usage
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return {
        isValid: false,
        message: 'Mã giảm giá đã hết lượt sử dụng'
      };
    }

    // Check minimum order total requirement
    if (discount.minOrderTotal && orderTotal < Number(discount.minOrderTotal)) {
      throw new BadRequestException({
        message: `Đơn hàng phải có giá trị tối thiểu ${Number(discount.minOrderTotal).toLocaleString('vi-VN')}đ để sử dụng mã giảm giá này`
      });
    }

    // Calculate discount amount
    let discountAmount: number;
    if (discount.discountType === 'percentage') {
      discountAmount = (orderTotal * Number(discount.value)) / 100;
      if (discount.maxDiscountValue && discountAmount > Number(discount.maxDiscountValue)) {
        discountAmount = Number(discount.maxDiscountValue);
      }
    } else {
      discountAmount = Number(discount.value);
    }

    return {
      isValid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        description: discount.description ?? undefined,
        discountType: discount.discountType,
        value: Number(discount.value),
        maxDiscountValue: discount.maxDiscountValue ? Number(discount.maxDiscountValue) : undefined,
        usedCount: discount.usedCount,
        isActive: discount.isActive,
        startDate: discount.startDate ?? undefined,
        endDate: discount.endDate ?? undefined,
        maxUses: discount.maxUses ?? undefined,
        minOrderTotal: discount.minOrderTotal ? Number(discount.minOrderTotal) : undefined,
        discountAmount,
      },
    };
  }

  async incrementUsageCount(id: string) {
    return this.prisma.discount.update({
      where: { id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }

  async updateUsedCount(id: string) {
    return this.prisma.discount.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }
} 
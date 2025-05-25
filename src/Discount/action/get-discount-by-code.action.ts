import { DiscountQuery } from "@/Discount/queries/discount.query";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class GetDiscountByCodeAction {
  constructor(private readonly discountQuery: DiscountQuery) { }

  async execute(code: string) {
    const discount = await this.discountQuery.getDiscountByCode(code.toUpperCase());
    if (!discount) {
      throw new NotFoundException('Không tìm thấy mã giảm giá');
    }
    if (discount.endDate && discount.endDate < new Date()) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }
    if (discount.startDate && discount.startDate > new Date()) {
      throw new BadRequestException('Mã giảm giá chưa bắt đầu');
    }
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }
    return discount;
  }
}
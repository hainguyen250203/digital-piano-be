import { GetDiscountByCodeAction } from '@/Discount/action/get-discount-by-code.action';
import { DiscountController } from '@/Discount/api/discount.controller';
import { DiscountQuery } from '@/Discount/queries/discount.query';
import { PrismaModule } from '@/Prisma/prisma.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [DiscountController],
  providers: [DiscountQuery, GetDiscountByCodeAction],
  exports: [DiscountQuery, GetDiscountByCodeAction],
})
export class DiscountModule { } 
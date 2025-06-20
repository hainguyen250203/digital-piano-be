import { NotificationModule } from '@/notification/notification.module';
import { PrismaModule } from '@/Prisma/prisma.module';
import { CancelProductReturnAction } from '@/ProductReturn/actions/cancel-product-return.action';
import { CreateProductReturnAction } from '@/ProductReturn/actions/create-product-return.action';
import { GetAllProductReturnsAction } from '@/ProductReturn/actions/get-all-product-returns.action';
import { GetUserProductReturnsAction } from '@/ProductReturn/actions/get-user-product-returns.action';
import { UpdateProductReturnStatusAction } from '@/ProductReturn/actions/update-product-return-status.action';
import { ProductReturnController } from '@/ProductReturn/product-return.controller';
import { Module } from '@nestjs/common';


@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [ProductReturnController],
  providers: [
    CreateProductReturnAction,
    UpdateProductReturnStatusAction,
    GetUserProductReturnsAction,
    GetAllProductReturnsAction,
    CancelProductReturnAction
  ],
})
export class ProductReturnModule { } 
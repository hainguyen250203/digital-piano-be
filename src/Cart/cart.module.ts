import { GetCartByUserIdAction } from '@/Cart/action/get-cart-by-user-id.action';
import { CartQuery } from '@/Cart/queries/cart.query';
import { PrismaModule } from '@/Prisma/prisma.module';
import { ProductModule } from '@/Product/product.module';
import { Module } from '@nestjs/common';
import { AddProductToCartAction } from './action/add-product-to-cart.action';
import { CartController } from './api/cart.controller';
@Module({
  imports: [PrismaModule, ProductModule],
  controllers: [CartController],
  providers: [AddProductToCartAction, CartQuery, GetCartByUserIdAction],
  exports: [AddProductToCartAction, CartQuery, GetCartByUserIdAction],
})
export class CartModule { }

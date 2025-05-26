import { AddressModule } from '@/Address/address.module';
import { AppController } from '@/app.controller';
import { AuthModule } from '@/Auth/auth.module';
import { BrandModule } from '@/Brand/brand.module';
import { CartModule } from '@/Cart/cart.module';
import { CategoryModule } from '@/Category/category.module';
import { CloudinaryModule } from '@/Cloudinary/cloudinary.module';
import { CommonConfigModule } from '@/Common/config/common-config.module';
import { DiscountModule } from '@/Discount/discount.module';
import { InvoiceModule } from '@/Invoice/invoice.module';
import { NotificationModule } from '@/notification/notification.module';
import { OrderModule } from '@/Order/order.module';
import { PaymentModule } from '@/Payment/payment.module';
import { PrismaModule } from '@/Prisma/prisma.module';
import { ProductModule } from '@/Product/product.module';
import { ProductTypeModule } from '@/ProductType/product-type.module';
import { ProfileModule } from '@/Profile/profile.module';
import { StatisticalModule } from '@/Statistical/statistical.module';
import { SubCategoryModule } from '@/SubCategory//sub-category.module';
import { SupplierModule } from '@/Supplier/supplier.module';
import { UserModule } from '@/User/user.module';
import { WishlistModule } from '@/Wishlist/wishlist.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonConfigModule, CloudinaryModule, AuthModule, PrismaModule,
    ProfileModule, CategoryModule, SubCategoryModule, BrandModule, ProductTypeModule,
    ProductModule, SupplierModule, InvoiceModule, CartModule, WishlistModule,
    DiscountModule, UserModule, AddressModule, NotificationModule, OrderModule,
    PaymentModule, StatisticalModule
  ],
  controllers: [AppController]
})
export class AppModule { }

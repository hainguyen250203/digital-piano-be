import { BrandModule } from '@/Brand/brand.module';
import { CloudinaryModule } from '@/Cloudinary/cloudinary.module';
import { PrismaModule } from '@/Prisma/prisma.module';
import { PrismaService } from '@/Prisma/prisma.service';
import { CreateProductAction } from '@/Product/action/create-product.action';
import { ProductController } from '@/Product/api/product.controller';
import { ProductQuery } from '@/Product/queries/product.query';
import { ProductTypeModule } from '@/ProductType/product-type.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, ProductTypeModule, CloudinaryModule, BrandModule],
  controllers: [ProductController],
  providers: [CreateProductAction, ProductQuery, PrismaService],
  exports: [CreateProductAction, ProductQuery]
})
export class ProductModule {}

import { PrismaModule } from '@/Prisma/prisma.module';
import { ProductTypeController } from '@/ProductType/api/product-type.controller';
import { ProductTypeQuery } from '@/ProductType/queries/product-type.query';
import { Module } from '@nestjs/common';

@Module({ imports: [PrismaModule], controllers: [ProductTypeController], providers: [ProductTypeQuery], exports: [ProductTypeQuery] })
export class ProductTypeModule {}

import { BrandController } from '@/Brand/api/brand.controller';
import { BrandQuery } from '@/Brand/queries/brand.query';
import { PrismaModule } from '@/Prisma/prisma.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [BrandController],
  providers: [BrandQuery],
  exports: [BrandQuery]
})
export class BrandModule {}

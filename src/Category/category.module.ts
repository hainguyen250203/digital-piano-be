import { CategoryController } from '@/Category/api/category.controller';
import { CategoryQuery } from '@/Category/queries/category.query';
import { PrismaModule } from '@/Prisma/prisma.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [CategoryQuery],
  exports: [CategoryQuery]
})
export class CategoryModule {}

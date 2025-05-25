import { PrismaModule } from '@/Prisma/prisma.module';
import { SubCategoryController } from '@/SubCategory//api/sub-category.controller';
import { SubCategoryQuery } from '@/SubCategory//queries/sub-category.query';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [SubCategoryController],
  providers: [SubCategoryQuery],
  exports: [SubCategoryQuery]
})
export class SubCategoryModule {}

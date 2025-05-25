import { PrismaModule } from '@/Prisma/prisma.module';
import { SupplierController } from '@/Supplier/api/supplier.controller';
import { SupplierQuery } from '@/Supplier/queries/supplier.query';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [SupplierController],
  providers: [SupplierQuery],
  exports: [SupplierQuery]
})
export class SupplierModule {}

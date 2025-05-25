import { PrismaModule } from '@/Prisma/prisma.module';
import { Module } from '@nestjs/common';
import { InvoiceController } from './api/invoice.controller';
import { InvoiceQuery } from './queries/invoice.query';

@Module({
  imports: [PrismaModule],
  controllers: [InvoiceController],
  providers: [InvoiceQuery],
  exports: [InvoiceQuery],
})
export class InvoiceModule {}

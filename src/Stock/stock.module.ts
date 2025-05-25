import { Module } from '@nestjs/common';

import { PrismaService } from '@/Prisma/prisma.service';
import { CreateStockAction } from '@/Stock/actions/create-stock.action';
import { UpdateStockAction } from '@/Stock/actions/update-stock.action';
import { StockController } from '@/Stock/api/stock.controller';
import { StockService } from '@/Stock/api/stock.service';
import { GetStockQuery } from '@/Stock/queries/stock.query';
@Module({
  controllers: [StockController],
  providers: [
    StockService,
    PrismaService,
    CreateStockAction,
    UpdateStockAction,
    GetStockQuery,
  ],
  exports: [StockService],
})
export class StockModule { }  
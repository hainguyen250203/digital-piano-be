import { OrderModule } from "@/Order/order.module";
import { PrismaModule } from "@/Prisma/prisma.module";
import { ProductModule } from "@/Product/product.module";
import { ProductStatisticsAction } from "@/Statistical/actions/product-statistics.action";
import { RevenueStatisticsAction } from "@/Statistical/actions/revenue-statistics.action";
import { SalesStatisticsAction } from "@/Statistical/actions/sales-statistics.action";
import { StockStatisticsAction } from "@/Statistical/actions/stock-statistics.action";
import { UserStatisticsAction } from "@/Statistical/actions/user-statistics.action";
import { StatisticalController } from "@/Statistical/api/statistical.controller";
import { StatisticalQuery } from "@/Statistical/queries/statistical.query";
import { StockModule } from "@/Stock/stock.module";
import { UserModule } from "@/User/user.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ProductModule,
    OrderModule,
    StockModule,
  ],
  controllers: [StatisticalController],
  providers: [
    StatisticalQuery,
    SalesStatisticsAction,
    ProductStatisticsAction,
    UserStatisticsAction,
    RevenueStatisticsAction,
    StockStatisticsAction
  ],
  exports: [
    StatisticalQuery,
    SalesStatisticsAction,
    ProductStatisticsAction,
    UserStatisticsAction,
    RevenueStatisticsAction,
    StockStatisticsAction
  ]
})
export class StatisticalModule { } 
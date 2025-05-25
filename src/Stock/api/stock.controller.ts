import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { StockService } from './stock.service';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @Roles(Role.admin, Role.staff)
  async createStock(
    @Body() data: { productId: string; quantity: number },
  ) {
    return this.stockService.createStock(data.productId, data.quantity);
  }

  @Get(':productId')
  @Roles(Role.admin, Role.staff)
  async getStock(@Param('productId') productId: string) {
    return this.stockService.getStock(productId);
  }

  @Post('update')
  @Roles(Role.admin, Role.staff)
  async updateStock(
    @Body()
    data: {
      productId: string;
      change: number;
      changeType: 'import' | 'sale' | 'return' | 'cancel' | 'adjustment';
      referenceType: 'invoice' | 'order' | 'product_return' | 'manual';
      referenceId?: string;
      note?: string;
    },
  ) {
    return this.stockService.updateStock(
      data.productId,
      data.change,
      data.changeType,
      data.referenceType,
      data.referenceId,
      data.note,
    );
  }
} 
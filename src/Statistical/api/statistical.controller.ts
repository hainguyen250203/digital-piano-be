import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { ProductStatisticsAction } from '@/Statistical/actions/product-statistics.action';
import { RevenueStatisticsAction } from '@/Statistical/actions/revenue-statistics.action';
import { SalesStatisticsAction } from '@/Statistical/actions/sales-statistics.action';
import { StockStatisticsAction } from '@/Statistical/actions/stock-statistics.action';
import { UserStatisticsAction } from '@/Statistical/actions/user-statistics.action';
import { StatisticalQuery } from '@/Statistical/queries/statistical.query';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GetProductStatisticsDto } from './dto/get-product-statistics.dto';
import { GetRevenueStatisticsDto } from './dto/get-revenue-statistics.dto';
import { GetSalesStatisticsDto } from './dto/get-sales-statistics.dto';
import { GetStockStatisticsDto } from './dto/get-stock-statistics.dto';
import { GetUserStatisticsDto } from './dto/get-user-statistics.dto';

@ApiTags('Thống kê')
@Controller({
  path: 'statistical',
  version: '1',
})
export class StatisticalController {
  constructor(
    private readonly salesStatisticsAction: SalesStatisticsAction,
    private readonly productStatisticsAction: ProductStatisticsAction,
    private readonly userStatisticsAction: UserStatisticsAction,
    private readonly revenueStatisticsAction: RevenueStatisticsAction,
    private readonly stockStatisticsAction: StockStatisticsAction,
    private readonly statisticalQuery: StatisticalQuery,
  ) { }

  @Get('sales')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê bán hàng', description: 'Lấy dữ liệu thống kê về đơn hàng và tình trạng bán hàng' })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu thống kê bán hàng đã được trả về thành công',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getSalesStatistics(@Query() query: GetSalesStatisticsDto) {
    const data = await this.salesStatisticsAction.execute({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    return new SuccessResponseDto('Lấy dữ liệu thống kê bán hàng thành công', data);
  }

  @Get('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê sản phẩm', description: 'Lấy dữ liệu thống kê về hiệu suất sản phẩm, sản phẩm bán chạy nhất' })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu thống kê sản phẩm đã được trả về thành công',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getProductStatistics(@Query() query: GetProductStatisticsDto) {
    const data = await this.productStatisticsAction.execute({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    return new SuccessResponseDto('Lấy dữ liệu thống kê sản phẩm thành công', data);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê người dùng', description: 'Lấy dữ liệu thống kê về người dùng, người dùng mới, khách hàng tiềm năng' })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu thống kê người dùng đã được trả về thành công',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getUserStatistics(@Query() query: GetUserStatisticsDto) {
    const data = await this.userStatisticsAction.execute({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    return new SuccessResponseDto('Lấy dữ liệu thống kê người dùng thành công', data);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê doanh thu', description: 'Lấy dữ liệu thống kê về doanh thu, lợi nhuận theo khoảng thời gian' })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu thống kê doanh thu đã được trả về thành công',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getRevenueStatistics(@Query() query: GetRevenueStatisticsDto) {
    const data = await this.revenueStatisticsAction.execute({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    return new SuccessResponseDto('Lấy dữ liệu thống kê doanh thu thành công', data);
  }

  @Get('stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê tồn kho', description: 'Lấy dữ liệu thống kê về tình trạng tồn kho, sản phẩm sắp hết hàng' })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu thống kê tồn kho đã được trả về thành công',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getStockStatistics(@Query() query: GetStockStatisticsDto) {
    const data = await this.stockStatisticsAction.execute(query);
    return new SuccessResponseDto('Lấy dữ liệu thống kê tồn kho thành công', data);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tổng quan thống kê', description: 'Lấy dữ liệu tổng quan cho bảng điều khiển admin' })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu tổng quan đã được trả về thành công',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getDashboardStatistics() {
    const data = await this.statisticalQuery.getDashboardStatistics();
    return new SuccessResponseDto('Lấy dữ liệu tổng quan thống kê thành công', data);
  }
} 
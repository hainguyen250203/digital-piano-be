import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { ProductStatisticsAction } from '@/Statistical/actions/product-statistics.action';
import { RevenueStatisticsAction } from '@/Statistical/actions/revenue-statistics.action';
import { SalesStatisticsAction } from '@/Statistical/actions/sales-statistics.action';
import { StockStatisticsAction } from '@/Statistical/actions/stock-statistics.action';
import { UserStatisticsAction } from '@/Statistical/actions/user-statistics.action';
import { ProductStatisticsResponseDto } from '@/Statistical/api/dto/res-product-statistics.dto';
import { RevenueStatisticsResponseDto } from '@/Statistical/api/dto/res-revenue-statistics.dto';
import { SalesStatisticsResponseDto } from '@/Statistical/api/dto/res-sales-statistics.dto';
import { UserStatisticsResponseDto } from '@/Statistical/api/dto/res-user-statistics.dto';
import { StatisticalQuery } from '@/Statistical/queries/statistical.query';
import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@ApiTags('Thống kê')
@Controller({
  path: 'statistical',
  version: '1',
})
@UseInterceptors(ClassSerializerInterceptor)
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
    type: SalesStatisticsResponseDto
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getSalesStatistics() {
    const data = await this.salesStatisticsAction.execute();
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
    type: ProductStatisticsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getProductStatistics() {
    const data = await this.productStatisticsAction.execute();
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
    type: UserStatisticsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getUserStatistics() {
    const data = await this.userStatisticsAction.execute();
    return new SuccessResponseDto('Lấy dữ liệu thống kê người dùng thành công', data);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê doanh thu', description: 'Lấy dữ liệu thống kê về doanh thu, lợi nhuận theo khoảng thời gian' })
  @ApiResponse({
    type: RevenueStatisticsResponseDto
  })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getRevenueStatistics() {
    const data = await this.revenueStatisticsAction.execute();
    return new SuccessResponseDto('Lấy dữ liệu thống kê doanh thu thành công', plainToInstance(RevenueStatisticsResponseDto, data));
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
  async getStockStatistics() {
    const data = await this.stockStatisticsAction.execute();
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
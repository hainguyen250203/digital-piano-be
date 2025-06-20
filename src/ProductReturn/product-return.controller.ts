import { Roles } from '@/Auth/decorators/roles.decorator';
import { GetUser } from '@/Auth/decorators/user.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { CancelProductReturnAction } from '@/ProductReturn/actions/cancel-product-return.action';
import { CreateProductReturnAction } from '@/ProductReturn/actions/create-product-return.action';
import { GetAllProductReturnsAction } from '@/ProductReturn/actions/get-all-product-returns.action';
import { GetUserProductReturnsAction } from '@/ProductReturn/actions/get-user-product-returns.action';
import { UpdateProductReturnStatusAction } from '@/ProductReturn/actions/update-product-return-status.action';
import { CreateProductReturnDto } from '@/ProductReturn/dto/create-product-return.dto';
import { ResProductReturnDto } from '@/ProductReturn/dto/res-product-return.dto';
import { UpdateProductReturnStatusDto } from '@/ProductReturn/dto/update-product-return-status.dto';
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';


@ApiTags('ProductReturn')
@Controller({
  path: 'product-returns',
  version: '1',
})
export class ProductReturnController {
  constructor(
    private readonly createProductReturnAction: CreateProductReturnAction,
    private readonly updateProductReturnStatusAction: UpdateProductReturnStatusAction,
    private readonly getUserProductReturnsAction: GetUserProductReturnsAction,
    private readonly getAllProductReturnsAction: GetAllProductReturnsAction,
    private readonly cancelProductReturnAction: CancelProductReturnAction,
  ) { }

  @Post(':orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.customer)
  @ApiOperation({ summary: 'Tạo yêu cầu trả hàng cho sản phẩm trong đơn hàng' })
  @ApiResponse({ status: 201, description: 'Tạo yêu cầu trả hàng thành công', type: ResProductReturnDto })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm trong đơn hàng' })
  async createReturnRequest(
    @Param('orderId') orderId: string,
    @GetUser('userId') userId: string,
    @Body() dto: CreateProductReturnDto,
  ) {
    const data = await this.createProductReturnAction.execute(userId, orderId, dto);
    return new SuccessResponseDto('Tạo yêu cầu trả hàng thành công', plainToInstance(ResProductReturnDto, data));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.customer)
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu trả hàng của người dùng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách yêu cầu trả hàng thành công', type: [ResProductReturnDto] })
  async getUserReturnRequests(@GetUser('userId') userId: string) {
    const data = await this.getUserProductReturnsAction.execute(userId);
    return new SuccessResponseDto('Lấy danh sách yêu cầu trả hàng thành công', plainToInstance(ResProductReturnDto, data));
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.staff)
  @ApiOperation({ summary: 'Lấy tất cả yêu cầu trả hàng (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Lấy tất cả yêu cầu trả hàng thành công', type: [ResProductReturnDto] })
  async getAllReturnRequests() {
    const data = await this.getAllProductReturnsAction.execute();
    return new SuccessResponseDto('Lấy tất cả yêu cầu trả hàng thành công', plainToInstance(ResProductReturnDto, data));
  }

  @Patch(':returnId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.staff)
  @ApiOperation({ summary: 'Cập nhật trạng thái yêu cầu trả hàng (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái yêu cầu trả hàng thành công', type: ResProductReturnDto })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu trả hàng' })
  async updateReturnStatus(
    @Param('returnId') returnId: string,
    @Body() dto: UpdateProductReturnStatusDto,
  ) {
    const data = await this.updateProductReturnStatusAction.execute(returnId, dto);
    return new SuccessResponseDto('Cập nhật trạng thái yêu cầu trả hàng thành công', plainToInstance(ResProductReturnDto, data));
  }

  @Patch(':returnId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.customer)
  @ApiOperation({ summary: 'Hủy yêu cầu trả hàng của người dùng' })
  @ApiResponse({ status: 200, description: 'Hủy yêu cầu trả hàng thành công', type: ResProductReturnDto })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu trả hàng' })
  async cancelReturnRequest(
    @Param('returnId') returnId: string,
    @GetUser('userId') userId: string,
  ) {
    const data = await this.cancelProductReturnAction.execute(userId, returnId);
    return new SuccessResponseDto('Hủy yêu cầu trả hàng thành công', plainToInstance(ResProductReturnDto, data));
  }
} 
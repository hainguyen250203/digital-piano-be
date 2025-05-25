import { Roles } from "@/Auth/decorators/roles.decorator";
import { GetUser } from "@/Auth/decorators/user.decorator";
import { JwtAuthGuard } from "@/Auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/Auth/guards/roles.guard";
import { SuccessResponseDto } from "@/Common/dto/base-response.dto";
import { AdminCancelOrderAction } from "@/Order/actions/admin-cancel-order.action";
import { CreateOrderAction } from "@/Order/actions/create-order.action";
import { RepaymentAction } from "@/Order/actions/repayment.action";
import { UpdateStatusOrderAction } from "@/Order/actions/update-status-order.action";
import { UserCancelOrderAction } from "@/Order/actions/user-cancel-order.action";
import { UserConfirmDeliveryAction } from "@/Order/actions/user-confirm-delivery.action";
import { UserChangePaymentMethodAction } from "@/Order/actions/user-change-payment-method.action";
    import { VerifyReturnUrlAction } from "@/Order/actions/verify-return-url.action";
import { ReqUpdateOrderStatusDto } from "@/Order/api/dto/req-update-order-status.dto";
import { ReqCreateOrderDto } from "@/Order/api/dto/reqCreateOrder.dto";
import { ResRepaymentDto } from "@/Order/api/dto/res-repayment.dto";
import { ResReturnUrlDto } from "@/Order/api/dto/res-return-url.dto";
import { ResOrderDto } from "@/Order/api/dto/resOrder.dto";
import { VerifyReturnUrlDto } from "@/Order/api/dto/verify-return-url-dto";
import { OrderQuery } from "@/Order/queries/order.query";
import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { Request } from 'express';
import { ReqChangePaymentMethodDto } from "@/Order/api/dto/req-change-payment-method.dto";

@Controller({
  path: 'orders',
  version: '1'
})
export class OrderController {
  constructor(
    private readonly createOrderAction: CreateOrderAction,
    private readonly orderQuery: OrderQuery,
    private readonly verifyReturnUrlAction: VerifyReturnUrlAction,
    private readonly updateStatusOrderAction: UpdateStatusOrderAction,
    private readonly userCancelOrderAction: UserCancelOrderAction,
    private readonly repaymentOrderAction: RepaymentAction,
    private readonly adminCancelOrderAction: AdminCancelOrderAction,
    private readonly userConfirmDeliveryAction: UserConfirmDeliveryAction,
    private readonly userChangePaymentMethodAction: UserChangePaymentMethodAction
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo đơn hàng' })
  @ApiResponse({ type: ResOrderDto })
  async createOrder(@Req() req: Request, @Body() body: ReqCreateOrderDto, @GetUser('userId') userId: string) {
    const ipAddr = this.getClientIp(req)
    const order = await this.createOrderAction.execute(userId, ipAddr, body);
    return new SuccessResponseDto('Đơn hàng đã được tạo thành công', plainToInstance(ResOrderDto, order));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng' })
  @ApiResponse({ type: [ResOrderDto] })
  async getOrders() {
    const orders = await this.orderQuery.getAllOrders();
    return new SuccessResponseDto('Danh sách đơn hàng', plainToInstance(ResOrderDto, orders));
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của người dùng' })
  @ApiResponse({ type: [ResOrderDto] })
  async getOrdersByUserId(@GetUser('userId') userId: string) {
    const orders = await this.orderQuery.getOrdersByUserId(userId);
    return new SuccessResponseDto('Danh sách đơn hàng', plainToInstance(ResOrderDto, orders));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin đơn hàng' })
  @ApiResponse({ status: 200, description: 'Thông tin đơn hàng' })
  async getOrderById(@Param('id') id: string) {
    const order = await this.orderQuery.getOrderById(id);
    return new SuccessResponseDto('Thông tin đơn hàng', order);
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0];
    }
    return req.socket.remoteAddress || '';
  }

  @Post('verify-return-url')
  @ApiOperation({ summary: 'Xác thực URL trả về từ VNPAY' })
  @ApiBody({ type: VerifyReturnUrlDto })
  @ApiResponse({ type: ResReturnUrlDto })
  async verifyReturnUrl(@Body() body: VerifyReturnUrlDto) {
    const result = await this.verifyReturnUrlAction.execute(body);
    return new SuccessResponseDto('URL trả về từ VNPAY đã được xác thực', plainToInstance(ResReturnUrlDto, result));
  }


  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  @ApiResponse({ type: ResOrderDto })
  async updateOrderStatus(@Param('id') id: string, @Body() reqUpdateOrderStatusDto: ReqUpdateOrderStatusDto) {
    const status = reqUpdateOrderStatusDto.status;
    const order = await this.updateStatusOrderAction.execute(id, status);
    return new SuccessResponseDto('Trạng thái đơn hàng đã được cập nhật', plainToInstance(ResOrderDto, order));
  }

  @Post(':id/user-cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hủy đơn hàng' })
  @ApiResponse({ type: ResOrderDto })
  async userCancelOrder(@Param('id') id: string) {
    const order = await this.userCancelOrderAction.execute(id);
    return new SuccessResponseDto('Đơn hàng đã được hủy', plainToInstance(ResOrderDto, order));
  }

  @Post(':id/admin-cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hủy đơn hàng bởi admin' })
  @ApiResponse({ type: ResOrderDto })
  async adminCancelOrder(@Param('id') id: string) {
    const order = await this.adminCancelOrderAction.execute(id);
    return new SuccessResponseDto('Đơn hàng đã được hủy', plainToInstance(ResOrderDto, order));
  }

  @Post(':id/repayment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thanh toán lại đơn hàng' })
  @ApiResponse({ type: ResRepaymentDto })
  async repaymentOrder(@Param('id') id: string, @Req() req: Request) {
    const ipAddr = this.getClientIp(req)
    const order = await this.repaymentOrderAction.execute(id, ipAddr);
    return new SuccessResponseDto('Đơn hàng đã được thanh toán lại', plainToInstance(ResRepaymentDto, order));
  }

  @Post(':id/user-confirm-delivery')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xác nhận giao hàng' })
  @ApiResponse({ type: ResOrderDto })
  async userConfirmDelivery(@Param('id') id: string, @GetUser('userId') userId: string) {
    const order = await this.userConfirmDeliveryAction.execute(id, userId);
    return new SuccessResponseDto('Đơn hàng đã được xác nhận giao thành công', plainToInstance(ResOrderDto, order));
  }

  @Post(':id/user-change-payment-method')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thay đổi phương thức thanh toán' })
  @ApiResponse({ type: ResOrderDto })
  async userChangePaymentMethod(@Param('id') id: string, @GetUser('userId') userId: string, @Body() body: ReqChangePaymentMethodDto) {
    const order = await this.userChangePaymentMethodAction.execute(id, userId, body.paymentMethod);
    return new SuccessResponseDto('Phương thức thanh toán đã được thay đổi', plainToInstance(ResOrderDto, order));
  } 
}

import { Roles } from '@/Auth/decorators/roles.decorator';
import { GetUser } from '@/Auth/decorators/user.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { AddProductToCartAction } from '@/Cart/action/add-product-to-cart.action';
import { GetCartByUserIdAction } from '@/Cart/action/get-cart-by-user-id.action';
import { CartQuery } from '@/Cart/queries/cart.query';
import { SuccessResponseDto } from '@/Common/dto/base-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReqAddProductToCard, ResCartDto, UpdateCartItemDto } from './dto/cart.dto';
@ApiTags('Giỏ hàng')
@Controller({ path: 'cart', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.customer, Role.admin, Role.staff)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly AddProductToCartAction: AddProductToCartAction,
    private readonly GetCartByUserIdAction: GetCartByUserIdAction,
    private readonly CartQuery: CartQuery
  ) { }
  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @ApiCreatedResponse({ type: SuccessResponseDto })
  @ApiBody({ type: ReqAddProductToCard })
  async addProductToCart(@Body() ReqAddProductToCard: ReqAddProductToCard, @GetUser('userId') userId: string) {
    try {
      const data = await this.AddProductToCartAction.execute(ReqAddProductToCard.productId, userId);
      return new SuccessResponseDto('Thêm sản phẩm vào giỏ hàng thành công', data);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy giỏ hàng' })
  @ApiCreatedResponse({ type: ResCartDto })
  async getCart(@GetUser('userId') userId: string) {
    const cart = await this.GetCartByUserIdAction.execute(userId);
    return new SuccessResponseDto('Lấy giỏ hàng thành công', cart);
  }

  @Delete()
  @ApiOperation({ summary: 'Xóa giỏ hàng' })
  @ApiCreatedResponse({ type: SuccessResponseDto })
  async deleteCart(@GetUser('userId') userId: string) {
    const data = await this.CartQuery.deleteCart(userId);
    return new SuccessResponseDto('Xóa giỏ hàng thành công', data);
  }

  @Delete('/:cartItemId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  @ApiCreatedResponse({ type: SuccessResponseDto })
  async deleteCartItem(@Param('cartItemId') cartItemId: string) {
    await this.CartQuery.deleteCartItem(cartItemId);
    return new SuccessResponseDto('Xóa sản phẩm khỏi giỏ hàng thành công', null);
  }

  @Patch('/:cartItemId')
  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng' })
  @ApiCreatedResponse({ type: SuccessResponseDto })
  async updateCartItem(@Param('cartItemId') cartItemId: string, @Body() updateCartItemDto: UpdateCartItemDto) {
    const data = await this.CartQuery.updateCartItem(cartItemId, updateCartItemDto.quantity);
    return new SuccessResponseDto('Cập nhật số lượng sản phẩm trong giỏ hàng thành công', data);
  }
}

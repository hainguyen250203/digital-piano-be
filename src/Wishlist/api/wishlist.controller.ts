import { GetUser } from '@/Auth/decorators/user.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { CreateWishlistDto, WishlistResponseDto } from '@/Wishlist/api/dto/wishlist.dto';
import { CreateWishListParams } from '@/Wishlist/queries/create-wish-list.prams';
import { WishlistQuery } from '@/Wishlist/queries/wishlist.query';
import { Body, Controller, Delete, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

@ApiTags('Danh sách yêu thích')
@Controller({
  path: 'wishlists',
  version: '1'
})
export class WishlistController {
  constructor(private readonly wishlistQuery: WishlistQuery) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu thích của người dùng hiện tại' })
  @ApiOkResponse({ description: 'Danh sách yêu thích của người dùng', type: WishlistResponseDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserWishlists(
    @GetUser('userId') userId: string
  ) {
    const wishlists = await this.wishlistQuery.getWishlistByUserId(userId);
    return new SuccessResponseDto('Lấy danh sách yêu thích thành công', plainToInstance(WishlistResponseDto, wishlists, { excludeExtraneousValues: true }));
  }


  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào danh sách yêu thích' })
  @ApiCreatedResponse({ description: 'Sản phẩm đã được thêm vào danh sách yêu thích', type: WishlistResponseDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createWishlist(
    @Body() createWishlistDto: CreateWishlistDto,
    @GetUser('userId') userId: string
  ) {
    const data: CreateWishListParams = {
      userId,
      productId: createWishlistDto.productId
    };
    const wishlist = await this.wishlistQuery.createWishlist(data);
    return new SuccessResponseDto(
      'Thêm sản phẩm vào danh sách yêu thích thành công',
      plainToInstance(WishlistResponseDto, wishlist, { excludeExtraneousValues: true })
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi danh sách yêu thích theo ID' })
  @ApiOkResponse({ description: 'Sản phẩm đã được xóa khỏi danh sách yêu thích' })
  @ApiParam({ name: 'id', description: 'ID danh sách yêu thích' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteWishlist(@Param('id') id: string, @GetUser('userId') userId: string) {
    // Check if wishlist exists and belongs to user
    const wishlist = await this.wishlistQuery.getWishlistByUserId(userId);
    if (!wishlist) {
      throw new NotFoundException(`Không tìm thấy danh sách yêu thích với user id ${userId}`);
    }
    await this.wishlistQuery.deleteWishlist(id);
    return new SuccessResponseDto('Xóa sản phẩm khỏi danh sách yêu thích thành công', null);
  }

  @Delete('product/:productId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi danh sách yêu thích theo ID sản phẩm' })
  @ApiOkResponse({ description: 'Sản phẩm đã được xóa khỏi danh sách yêu thích' })
  @ApiParam({ name: 'productId', description: 'ID sản phẩm' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteWishlistByProductId(
    @Param('productId') productId: string,
    @GetUser('userId') userId: string
  ) {
    const deleted = await this.wishlistQuery.deleteWishlistByUserIdAndProductId(userId, productId);
    if (!deleted) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${productId} trong danh sách yêu thích`);
    }
    return new SuccessResponseDto('Xóa sản phẩm khỏi danh sách yêu thích thành công', null);
  }
} 
import { PrismaService } from '@/Prisma/prisma.service';
import { CreateWishListParams } from '@/Wishlist/queries/create-wish-list.prams';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class WishlistQuery {
  constructor(private prisma: PrismaService) { }


  async getWishlistByUserId(userId: string) {
    return await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        user: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            defaultImage: true
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getWishlistByUserIdAndProductId(userId: string, productId: string) {
    return await this.prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      },
    });
  }

  async createWishlist(dto: CreateWishListParams) {
    const { userId, productId } = dto;

    // Check if wishlist already exists
    const existingWishlist = await this.getWishlistByUserIdAndProductId(userId, productId);
    if (existingWishlist) {
      throw new BadRequestException('Sản phẩm đã tồn tại trong danh sách yêu thích');
    }

    return this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
      include: {
        user: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            defaultImage: true,
          },
        },
      },
    });
  }

  async deleteWishlist(id: string) {
    return this.prisma.wishlist.delete({
      where: { id },
    });
  }

  async deleteWishlistByUserIdAndProductId(userId: string, productId: string) {
    const wishlist = await this.getWishlistByUserIdAndProductId(userId, productId);

    if (!wishlist) {
      return null;
    }

    return this.prisma.wishlist.delete({
      where: { id: wishlist.id },
    });
  }


} 
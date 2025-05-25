import { PrismaService } from "@/Prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class CartQuery {
  constructor(private readonly prisma: PrismaService) { }

  // Cart operations
  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            product: { select: { id: true, name: true, price: true, defaultImage: true, salePrice: true } }
          },
        },
      }
    });
    return cart;
  }

  async createCart(userId: string) {
    const cart = await this.prisma.cart.create({
      data: { userId },
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            product: { select: { id: true, name: true, price: true, defaultImage: true, salePrice: true } }
          },
        },
      }
    });
    return cart;
  }

  async deleteCart(userId: string) {
    const cart = await this.prisma.cart.delete({ where: { userId } });
    return cart;
  }

  // Cart items operations
  async getCartItem(productId: string, cartId: string) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { productId, cartId }
    });
    return cartItem;
  }

  async getCartItems(cartId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: {
        product: {
          select: { id: true, name: true, price: true, defaultImage: true, salePrice: true }
        }
      }
    });
    return cartItems;
  }

  async createCartItem(quantity: number, productId: string, cartId: string) {
    const cartItem = await this.prisma.cartItem.create({
      data: { productId, cartId, quantity }
    });
    return cartItem;
  }

  async updateCartItem(cartItemId: string, quantity: number) {
    const cartItem = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });
    return cartItem;
  }

  async deleteCartItem(cartItemId: string) {
    const cartItem = await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    return cartItem;
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return true;
  }
}

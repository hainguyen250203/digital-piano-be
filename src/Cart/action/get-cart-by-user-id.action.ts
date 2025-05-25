import { CartQuery } from "@/Cart/queries/cart.query";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class GetCartByUserIdAction {
  constructor(private readonly cartQuery: CartQuery) { }

  async execute(userId: string) {
    const cart = await this.cartQuery.getCart(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.items.reduce((acc, item) => acc + (item.product.salePrice || item.product.price) * item.quantity, 0);
    return {
      ...cart,
      totalQuantity,
      totalPrice
    };
  }
}

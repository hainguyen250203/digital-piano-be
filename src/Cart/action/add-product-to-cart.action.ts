import { CartQuery } from "@/Cart/queries/cart.query";
import { ProductQuery } from "@/Product/queries/product.query";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class AddProductToCartAction {
  constructor(private readonly cartQuery: CartQuery, private readonly productQuery: ProductQuery) { }
  async execute(productId: string, userId: string) {
    // Find product first to fail fast
    const product = await this.productQuery.findOne(productId);
    if (!product) throw new NotFoundException('Product not found');
    
    // Get or create cart
    let cart = await this.cartQuery.getCart(userId);
    if (!cart) cart = await this.cartQuery.createCart(userId);
    
    // Check if product is already in cart
    const cartItem = await this.cartQuery.getCartItem(productId, cart.id);
    
    if (cartItem) {
      // Update existing item if stock allows
      const newQuantity = cartItem.quantity + 1;
      
      if (product.stock?.quantity && product.stock.quantity < newQuantity) {
        throw new BadRequestException('Sản phẩm không còn đủ hàng');
      }
      
      await this.cartQuery.updateCartItem(cartItem.id, newQuantity);
    } else {
      // Add new item if stock allows
      if (product.stock?.quantity === 0) {
        throw new BadRequestException('Sản phẩm đã hết hàng');
      }
      
      await this.cartQuery.createCartItem(1, productId, cart.id);
    }
    
    return true;
  }
}

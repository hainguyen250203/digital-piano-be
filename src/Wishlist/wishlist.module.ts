import { PrismaModule } from '@/Prisma/prisma.module';
import { WishlistController } from '@/Wishlist/api/wishlist.controller';
import { WishlistQuery } from '@/Wishlist/queries/wishlist.query';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [WishlistController],
  providers: [WishlistQuery],
  exports: [WishlistQuery],
})
export class WishlistModule {}

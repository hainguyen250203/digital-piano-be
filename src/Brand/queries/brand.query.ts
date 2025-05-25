import { SortOrder } from '@/Common/dto/get-query.dto';
import { PrismaService } from '@/Prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class BrandQuery {
  constructor(private readonly prisma: PrismaService) { }
  async createBrand(name: string) {
    return await this.prisma.brand.create({ data: { name } });
  }
  async getBrands(skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    return await this.prisma.brand.findMany({ skip, take, orderBy: { createdAt: sort } });
  }
  async getBrandById(id: string) {
    return await this.prisma.brand.findUnique({ where: { id } });
  }
  async updateBrandById(id: string, name: string, isDeleted: boolean) {
    return await this.prisma.brand.update({ where: { id }, data: { name, isDeleted } });
  }
  async deleteBrandById(id: string) {
    return await this.prisma.brand.update({ where: { id }, data: { isDeleted: true } });
  }
  async getProductsByBrandId(id: string, skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    const products = await this.prisma.product.findMany({
      where: { brandId: id }, skip, take,
      select: {
        id: true,
        name: true,
        price: true,
        isHotSale: true,
        isFeatured: true,
        salePrice: true,
        createdAt: true,
        defaultImage: true,
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true, category: { select: { id: true, name: true } } } },
        brand: { select: { id: true, name: true } },
        stock: { select: { id: true, quantity: true } }

      },
      orderBy: { createdAt: sort }
    });
    const brand = await this.prisma.brand.findFirst()
    if (!brand) throw new BadRequestException("")
    return {
      id: brand.id,
      name: brand.name,
      products
    }
  }
}

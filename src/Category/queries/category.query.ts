import { SortOrder } from '@/Common/dto/get-query.dto';
import { PrismaService } from '@/Prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CategoryQuery {
  constructor(private readonly prisma: PrismaService) { }
  async createCategory(name: string) {
    return await this.prisma.category.create({ data: { name } });
  }
  async getCategories() {
    return await this.prisma.category.findMany({ orderBy: { createdAt: SortOrder.DESC } });
  }
  async getCategoryById(id: string) {
    return await this.prisma.category.findUnique({ where: { id } });
  }
  async updateCategoryById(id: string, name: string, isDeleted: boolean) {
    return await this.prisma.category.update({ where: { id }, data: { name, isDeleted } });
  }
  async deleteCategoryById(id: string) {
    return await this.prisma.category.update({ where: { id }, data: { isDeleted: true } });
  }
  async getMenu() {
    return await this.prisma.category.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        subCategories: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            productTypes: {
              where: { isDeleted: false },
              select: {
                id: true,
                name: true
              },
              orderBy: { name: SortOrder.ASC }
            },
          },
          orderBy: { name: SortOrder.ASC }
        },
      },
      orderBy: { createdAt: SortOrder.ASC }
    });
  }
  async getProductsByCategory(categoryId: string, skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    const products = await this.prisma.product.findMany({
      where: {
        subCategory: {
          category: { id: categoryId, isDeleted: false },
          isDeleted: false
        },
        isDeleted: false
      },
      skip,
      take,
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
        subCategory: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        stock: { select: { id: true, quantity: true } }
      },
      orderBy: { createdAt: sort }
    });
    const category = await this.prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, name: true } });
    if (!category) throw new BadRequestException('Không tìm thấy danh mục sản phẩm');
    return { id: category.id, name: category.name, products };
  }
}

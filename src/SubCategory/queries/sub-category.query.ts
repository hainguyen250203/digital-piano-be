import { SortOrder } from '@/Common/dto/get-query.dto';
import { PrismaService } from '@/Prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SubCategoryQuery {
  constructor(private readonly prisma: PrismaService) { }
  async create(name: string, categoryId: string) {
    if (!categoryId || !name) throw new Error('categoryId or name is required');
    return this.prisma.subCategory.create({ data: { name, category: { connect: { id: categoryId } } } });
  }
  async findAll(skip?: number, take?: number) {
    return await this.prisma.subCategory.findMany({ skip, take, orderBy: { createdAt: SortOrder.DESC }, select: { id: true, name: true, isDeleted: true, createdAt: true, updatedAt: true, category: { select: { id: true, name: true } } } });
  }
  async findOne(id: string) {
    if (!id) throw new Error('id is required');
    return await this.prisma.subCategory.findUnique({ where: { id }, include: { category: { select: { id: true, name: true } } } });
  }

  async findAllProductsBySubCategoryId(subCategoryId: string, skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    const products = await this.prisma.product.findMany({
      where: {
        subCategory: {
          id: subCategoryId,
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
        salePrice: true,
        isHotSale: true,
        isFeatured: true,
        createdAt: true,
        defaultImage: true,
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        stock: { select: { id: true, quantity: true } }
      },
      orderBy: { createdAt: sort }
    });
    const subCategory = await this.findOne(subCategoryId);
    if (!subCategory) throw new BadRequestException('Không tìm thấy danh mục sản phẩm');
    return { id: subCategory.id, name: subCategory.name, products, category: { id: subCategory.category.id, name: subCategory.category.name } };
  }

  async update(id: string, name: string, categoryId: string, isDeleted: boolean) {
    if (!id || !name || !categoryId) throw new Error('id or name or categoryId is required');
    return await this.prisma.subCategory.update({ where: { id }, data: { name, category: { connect: { id: categoryId } }, isDeleted }, include: { category: { select: { id: true, name: true } } } });
  }
  async remove(id: string) {
    if (!id) throw new Error('id is required');
    return await this.prisma.subCategory.update({ where: { id }, data: { isDeleted: true } });
  }

  async getSubCategoryByCategoryId(categoryId: string) {
    return await this.prisma.subCategory.findMany({ where: { categoryId, isDeleted: false } });
  }
}

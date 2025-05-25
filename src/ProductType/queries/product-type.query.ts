import { SortOrder } from '@/Common/dto/get-query.dto';
import { PrismaService } from '@/Prisma/prisma.service';
import { CreateProductTypeParams } from '@/ProductType/queries/dto/create-product-type.params';
import { UpdateProductTypeParams } from '@/ProductType/queries/dto/update-product-type.params';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ProductTypeQuery {
  constructor(private readonly prisma: PrismaService) { }
  async create(createProductTypeParams: CreateProductTypeParams) {
    return await this.prisma.productType.create({
      data: {
        name: createProductTypeParams.name,
        subCategory: { connect: { id: createProductTypeParams.subCategoryId } }
      }
    });
  }

  async findAll(skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    return await this.prisma.productType.findMany({ skip, take, orderBy: { createdAt: sort }, select: { id: true, name: true, isDeleted: true, createdAt: true, updatedAt: true, subCategory: { select: { id: true, name: true } } } });
  }

  async findOne(id: string) {
    return await this.prisma.productType.findUnique({
      where: { id },
      include: {
        subCategory: { select: { id: true, name: true } }
      }
    });
  }

  async findProductsByProductTypeId(id: string, skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    const products = await this.prisma.product.findMany({
      where: {
        productType: { id, isDeleted: false },
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
        defaultImage: true,
        brand: { select: { id: true, name: true } },
        stock: { select: { id: true, quantity: true } }
      },
      orderBy: { createdAt: sort }
    });
    return products;
  }

  async update(updateProductTypeParams: UpdateProductTypeParams) {
    const { id, ...params } = updateProductTypeParams;
    return this.prisma.productType.update({
      where: { id },
      data: params
    });
  }

  async remove(id: string) {
    return await this.prisma.productType.update({ where: { id }, data: { isDeleted: true } });
  }

  async getProductByProductType(id: string) {
    const productType = await this.prisma.productType.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            isHotSale: true,
            isFeatured: true,
            salePrice: true,
            defaultImage: true,
            brand: { select: { id: true, name: true } },
            stock: { select: { id: true, quantity: true } },
            productType: { select: { id: true, name: true } },
            subCategory: { select: { id: true, name: true, category: { select: { id: true, name: true } } } }
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!productType) throw new BadRequestException('Không tìm thấy loại sản phẩm');
    return {
      id: productType.id,
      name: productType.name,
      products: productType.products,
      category: {
        id: productType.subCategory.category.id,
        name: productType.subCategory.category.name
      },
      subCategory: {
        id: productType.subCategory.id,
        name: productType.subCategory.name
      }
    };
  }

  async getProductTypeBySubCategoryId(subCategoryId: string) {
    return await this.prisma.productType.findMany({ where: { subCategoryId }, include: { products: { select: { id: true, name: true, price: true, isHotSale: true, isFeatured: true, salePrice: true, defaultImage: true, brand: { select: { id: true, name: true } }, stock: { select: { id: true, quantity: true } } } } } });
  }
}

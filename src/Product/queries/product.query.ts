import { SortOrder } from '@/Common/dto/get-query.dto';
import { PrismaService } from '@/Prisma/prisma.service';
import { ResAllProductDto } from '@/Product/api/dto/res-all-product.dto';
import { CreateProductQueryParams } from '@/Product/queries/dto/create-product.params';
import { UpdateProductQueryParams } from '@/Product/queries/dto/update-product.params';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductQuery {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProductParams: CreateProductQueryParams): Promise<ResAllProductDto> {
    const { brandId, productTypeId, subCategoryId, images, defaultImageUrl, ...data } = createProductParams;

    // Create product with basic data and relationships
    const product = await this.createProductWithRelations(data, {
      brandId,
      productTypeId,
      subCategoryId
    });

    // Create and link images
    const createdImages = await this.createProductImages(product.id, images);

    // Set default image if images exist
    if (createdImages.length > 0) {
      await this.setDefaultImage(product.id, createdImages, defaultImageUrl);
    }

    // Fetch and return complete product data
    const result = await this.getCompleteProduct(product.id);
    if (!result) {
      throw new Error('Product not found after creation');
    }

    return result;
  }

  private async createProductWithRelations(
    data: Omit<CreateProductQueryParams, 'brandId' | 'productTypeId' | 'subCategoryId' | 'images' | 'defaultImageUrl'>,
    relations: { brandId?: string; productTypeId?: string; subCategoryId: string }
  ) {
    const { brandId, productTypeId, subCategoryId } = relations;
    const productData: Prisma.ProductCreateInput = {
      ...data,
      subCategory: { connect: { id: subCategoryId } },
      ...(brandId && { brand: { connect: { id: brandId } } }),
      ...(productTypeId && { productType: { connect: { id: productTypeId } } })
    };

    return await this.prisma.product.create({ data: productData });
  }

  private async createProductImages(productId: string, imageUrls: string[]) {
    await Promise.all(
      imageUrls.map(url =>
        this.prisma.image.create({
          data: { url, productId }
        })
      )
    );

    return await this.prisma.image.findMany({
      where: { productId }
    });
  }

  private async setDefaultImage(productId: string, images: { id: string; url: string }[], defaultImageUrl?: string) {
    const defaultImageId = defaultImageUrl
      ? images.find(img => img.url === defaultImageUrl)?.id || images[0].id
      : images[0].id;

    await this.prisma.product.update({
      where: { id: productId },
      data: { defaultImageId }
    });
  }

  private async getCompleteProduct(productId: string) {
    const result = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        defaultImage: true,
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } }
          }
        },
        stock: true
      }
    });

    if (!result) return null;
    return plainToInstance(ResAllProductDto, result, { excludeExtraneousValues: true });
  }

  async findAll(skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    return await this.prisma.product.findMany({
      skip,
      take,
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        isHotSale: true,
        isFeatured: true,
        isDeleted: true,
        createdAt: true,
        defaultImage: { select: { id: true, url: true } },
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } },
        stock: { select: { id: true, quantity: true } }
      },
      orderBy: { createdAt: sort }
    });
  }

  async findOne(id: string) {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        defaultImage: true,
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true, category: { select: { id: true, name: true } } } },
        stock: { select: { id: true, quantity: true } },
        reviews: {
          include: {
            user: { select: { id: true, email: true, avatarUrl: true } }
          }
        }
      }
    });
  }

  async findOneByName(name: string) {
    return await this.prisma.product.findUnique({
      where: { name, isDeleted: false },
      include: {
        images: true,
        defaultImage: true,
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } }
      }
    });
  }

  async update(id: string, updateProductParams: UpdateProductQueryParams) {
    const { brandId, productTypeId, subCategoryId, isDeleted, ...data } = updateProductParams;

    // Build the data object conditionally
    const updateData: any = { ...data };

    // Only include isDeleted if explicitly provided
    if (isDeleted !== undefined) {
      updateData.isDeleted = isDeleted;
    }

    // Add relations if provided
    if (subCategoryId) {
      updateData.subCategory = { connect: { id: subCategoryId } };
    }
    if (brandId) {
      updateData.brand = { connect: { id: brandId } };
    }
    if (productTypeId) {
      updateData.productType = { connect: { id: productTypeId } };
    }

    return await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        defaultImage: true,
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } }
      }
    });
  }

  async updateImages(productId: string, imageUrls: string[]) {
    // Step 1: Get the product to make sure it exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return null;
    }

    // Step 2: Clear default image reference first to avoid FK constraints
    await this.prisma.product.update({
      where: { id: productId },
      data: { defaultImageId: null }
    });

    // Step 3: Delete all existing images
    await this.prisma.image.deleteMany({
      where: { productId }
    });

    // Step 4: Create new images
    for (const imageUrl of imageUrls) {
      await this.prisma.image.create({
        data: {
          url: imageUrl,
          productId
        }
      });
    }

    // Step 5: Get all newly created images
    const newImages = await this.prisma.image.findMany({
      where: { productId }
    });

    // Step 6: Set first image as default if any exist
    if (newImages.length > 0) {
      await this.prisma.product.update({
        where: { id: productId },
        data: { defaultImageId: newImages[0].id }
      });
    }

    // Step 7: Return the updated product
    return await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        defaultImage: true,
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } }
      }
    });
  }

  async updateDefaultImage(productId: string, imageId: string) {
    return await this.prisma.product.update({
      where: { id: productId },
      data: { defaultImageId: imageId },
      include: {
        images: true,
        defaultImage: true,
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } }
      }
    });
  }

  async deleteImages(productId: string, imageIds: string[]) {
    // Step 1: Check if product exists and get its current default image
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { defaultImage: true }
    });

    if (!product) {
      return null;
    }

    // Step 2: Check if default image is among those to be deleted
    const isDefaultImageBeingDeleted = product.defaultImage &&
      imageIds.includes(product.defaultImage.id);

    // Step 3: If default image will be deleted, disconnect it first
    if (isDefaultImageBeingDeleted) {
      await this.prisma.product.update({
        where: { id: productId },
        data: { defaultImageId: null }
      });
    }

    // Step 4: Delete the specified images
    await this.prisma.image.deleteMany({
      where: {
        id: { in: imageIds },
        productId
      }
    });

    // Step 5: If we deleted the default image, set a new one if available
    if (isDefaultImageBeingDeleted) {
      const remainingImages = await this.prisma.image.findMany({
        where: { productId }
      });

      if (remainingImages.length > 0) {
        await this.prisma.product.update({
          where: { id: productId },
          data: { defaultImageId: remainingImages[0].id }
        });
      }
    }

    // Step 6: Return the updated product
    return await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        defaultImage: true,
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } }
      }
    });
  }

  async delete(id: string) {
    return await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  async findHotSaleProducts(skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    return await this.prisma.product.findMany({
      where: {
        isHotSale: true,
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
        defaultImage: { select: { id: true, url: true } },
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } },
        stock: { select: { id: true, quantity: true } }
      },
      orderBy: { createdAt: sort }
    });
  }

  async findFeaturedProducts(skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    return await this.prisma.product.findMany({
      where: {
        isFeatured: true,
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
        defaultImage: { select: { id: true, url: true } },
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } },
        stock: { select: { id: true, quantity: true } }
      },
      orderBy: { createdAt: sort }
    });
  }

  async findRelatedProducts(productId: string, limit: number = 8) {
    // First, get the product to find its category and type
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        subCategoryId: true,
        productTypeId: true,
        brandId: true
      }
    });

    if (!product) {
      return [];
    }

    // Find related products based on same subcategory and/or product type
    return await this.prisma.product.findMany({
      where: {
        id: { not: productId }, // Exclude the current product
        isDeleted: false,
        OR: [
          // Same subcategory
          { subCategoryId: product.subCategoryId },
          // Same product type if exists
          ...(product.productTypeId ? [{ productTypeId: product.productTypeId }] : []),
          // Same brand if exists
          ...(product.brandId ? [{ brandId: product.brandId }] : [])
        ]
      },
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        isHotSale: true,
        isFeatured: true,
        defaultImage: { select: { id: true, url: true } },
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } },
        stock: { select: { id: true, quantity: true } }
      },
      orderBy: { createdAt: SortOrder.DESC }
    });
  }

  async findBestSellerProducts() {
    // Get all orders with their items and products
    const orders = await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Count the frequency of each product in orders
    const productSales: Record<string, number> = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId;
        const quantity = item.quantity || 1;

        if (productSales[productId]) {
          productSales[productId] += quantity;
        } else {
          productSales[productId] = quantity;
        }
      });
    });

    // Convert to array and sort by sales count (descending)
    const bestSellerIds = Object.entries(productSales)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .map(([id]) => id);

    if (bestSellerIds.length === 0) {
      return [];
    }

    // Fetch product details
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: bestSellerIds },
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        isHotSale: true,
        isFeatured: true,
        defaultImage: { select: { id: true, url: true } },
        brand: { select: { id: true, name: true } },
        productType: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } },
        stock: { select: { id: true, quantity: true } }
      }
    });

    // Order them according to bestSellerIds
    const productMap = new Map(products.map(product => [product.id, product]));
    return bestSellerIds.map(id => productMap.get(id)).filter(Boolean);
  }

}

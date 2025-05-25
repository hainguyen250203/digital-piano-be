import {
  BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query,
  UploadedFiles,
  UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

// Auth imports
import { Public } from '@/Auth/decorators/public.decorator';
import { Roles } from '@/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';

// Common and service imports
import { CloudinaryQuery } from '@/Cloudinary/queries/cloudinary.query';
import { SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { GetQueryDto, SortOrder } from '@/Common/dto/get-query.dto';
import { PrismaService } from '@/Prisma/prisma.service';

// Product-specific imports
import { CreateProductAction } from '@/Product/action/create-product.action';
import { ReqCreateProductDto } from '@/Product/api/dto/req-create-product.dto';
import { ReqDeleteImagesDto } from '@/Product/api/dto/req-delete-images.dto';
import { ReqSetDefaultImageDto } from '@/Product/api/dto/req-set-default-image.dto';
import { ReqUpdateProductImagesDto } from '@/Product/api/dto/req-update-product-images.dto';
import { ReqUpdateProductDto } from '@/Product/api/dto/req-update-product.dto';
import { ResAllProductDto } from '@/Product/api/dto/res-all-product.dto';
import { ResProductDto } from '@/Product/api/dto/res-product.dto';
import { ProductQuery } from '@/Product/queries/product.query';

@ApiTags('Sản phẩm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller({ path: 'products', version: '1' })
export class ProductController {
  constructor(
    private readonly createProductAction: CreateProductAction,
    private readonly productQuery: ProductQuery,
    private readonly cloudinaryQuery: CloudinaryQuery,
    private readonly prisma: PrismaService,
  ) { }

  // ================= READ ENDPOINTS =================

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm', description: 'Lấy toàn bộ danh sách sản phẩm, có hỗ trợ phân trang.' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order (asc or desc)' })
  @ApiOkResponse({ type: [ResAllProductDto] })
  async findAll(@Query() query: GetQueryDto) {
    const { skip, take, sort = SortOrder.DESC } = query;
    // If skip and take are not provided, fetch all records
    const parsedSkip = skip ? parseInt(skip.toString(), 10) : undefined;
    const parsedTake = take ? parseInt(take.toString(), 10) : undefined;

    const products = await this.productQuery.findAll(parsedSkip, parsedTake, sort);
    return new SuccessResponseDto('Lấy danh sách sản phẩm thành công', plainToInstance(ResAllProductDto, products, { excludeExtraneousValues: true }));
  }

  @Get('hot-sale')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm hot sale', description: 'Lấy danh sách các sản phẩm được đánh dấu là hot sale, có hỗ trợ phân trang.' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order (asc or desc)' })
  @ApiOkResponse({ type: [ResAllProductDto] })
  async findHotSaleProducts(@Query() query: GetQueryDto) {
    const { skip, take, sort = SortOrder.DESC } = query;
    const parsedSkip = skip ? parseInt(skip.toString(), 10) : undefined;
    const parsedTake = take ? parseInt(take.toString(), 10) : undefined;

    const products = await this.productQuery.findHotSaleProducts(parsedSkip, parsedTake, sort);
    return new SuccessResponseDto('Lấy danh sách sản phẩm hot sale thành công', plainToInstance(ResAllProductDto, products, { excludeExtraneousValues: true }));
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm nổi bật', description: 'Lấy danh sách các sản phẩm được đánh dấu là nổi bật, có hỗ trợ phân trang.' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order (asc or desc)' })
  @ApiOkResponse({ type: [ResAllProductDto] })
  async findFeaturedProducts(@Query() query: GetQueryDto) {
    const { skip, take, sort = SortOrder.DESC } = query;
    const parsedSkip = skip ? parseInt(skip.toString(), 10) : undefined;
    const parsedTake = take ? parseInt(take.toString(), 10) : undefined;

    const products = await this.productQuery.findFeaturedProducts(parsedSkip, parsedTake, sort);
    return new SuccessResponseDto('Lấy danh sách sản phẩm nổi bật thành công', plainToInstance(ResAllProductDto, products, { excludeExtraneousValues: true }));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm', description: 'Lấy thông tin chi tiết sản phẩm theo ID.' })
  async findOne(@Param('id') id: string) {
    const data = await this.productQuery.findOne(id);
    if (!data) throw new NotFoundException('Sản phẩm không tồn tại');
    return new SuccessResponseDto('Lấy sản phẩm thành công', plainToInstance(ResProductDto, data, { excludeExtraneousValues: true }));
  }

  @Get(':id/related')
  @Public()
  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm liên quan',
    description: 'Lấy danh sách các sản phẩm liên quan dựa trên cùng danh mục, loại sản phẩm hoặc thương hiệu.'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng sản phẩm liên quan muốn lấy (mặc định là 8)' })
  @ApiOkResponse({ type: [ResAllProductDto] })
  async findRelatedProducts(
    @Param('id') id: string,
    @Query('limit') limit?: number
  ) {
    // Check if the product exists
    const product = await this.productQuery.findOne(id);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    // Get related products
    const parsedLimit = limit ? parseInt(limit.toString(), 10) : 8;
    const relatedProducts = await this.productQuery.findRelatedProducts(id, parsedLimit);

    return new SuccessResponseDto(
      'Lấy danh sách sản phẩm liên quan thành công',
      plainToInstance(ResAllProductDto, relatedProducts, { excludeExtraneousValues: true })
    );
  }

  // ================= CREATE ENDPOINTS =================

  @Post()
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'defaultImage', maxCount: 1 },
    { name: 'productImages', maxCount: 8 }
  ]))
  @ApiOperation({ summary: 'Tạo sản phẩm mới', description: 'Tạo một sản phẩm mới với thông tin, ảnh mặc định và các ảnh sản phẩm.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ReqCreateProductDto })
  @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công', type: SuccessResponseDto })
  async createProduct(
    @UploadedFiles() files: {
      defaultImage?: Express.Multer.File[],
      productImages?: Express.Multer.File[]
    },
    @Body() reqCreateProductDto: ReqCreateProductDto,
  ) {
    const productImages = files.productImages || [];
    const defaultImage = files.defaultImage && files.defaultImage.length > 0 ? files.defaultImage[0] : undefined;

    // Check if at least one product image is provided
    if (productImages.length === 0 && !defaultImage) {
      throw new BadRequestException('Ít nhất phải có một ảnh sản phẩm');
    }

    // Limit total number of images
    if (productImages.length > 8) {
      throw new BadRequestException('Tối đa 8 ảnh sản phẩm');
    }

    // Pass both the product images and default image to the create action
    const data = await this.createProductAction.execute(
      productImages,
      defaultImage,
      reqCreateProductDto
    );

    return new SuccessResponseDto('Tạo sản phẩm thành công', plainToInstance(ResAllProductDto, data, { excludeExtraneousValues: true }));
  }

  // ================= UPDATE ENDPOINTS =================

  @Patch(':id')
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'defaultImage', maxCount: 1 },
    { name: 'productImages', maxCount: 8 }
  ]))
  @ApiOperation({
    summary: 'Cập nhật sản phẩm',
    description: 'Cập nhật thông tin và hình ảnh của sản phẩm theo ID. Hỗ trợ đồng thời: cập nhật thông tin, upload ảnh mới, xóa ảnh và đặt ảnh mặc định.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ReqUpdateProductDto })
  async updateProduct(
    @Param('id') id: string,
    @Body() reqUpdateProductDto: ReqUpdateProductDto,
    @UploadedFiles() files?: {
      defaultImage?: Express.Multer.File[],
      productImages?: Express.Multer.File[]
    },
  ) {
    // Find the product first to make sure it exists
    const product = await this.productQuery.findOne(id);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    // Extract the image IDs to delete if provided
    const { imageIdsToDelete, defaultImageId, ...productData } = reqUpdateProductDto;

    // Process file uploads if any were provided
    const hasProductImages = !!files?.productImages && files.productImages.length > 0;
    const hasDefaultImage = !!files?.defaultImage && files.defaultImage.length > 0;
    const hasDefaultImageId = !!defaultImageId;
    const hasImagesToDelete = !!imageIdsToDelete && imageIdsToDelete.length > 0;
    const hasProductUpdates = Object.keys(productData).length > 0;

    // Handle image deletions first if requested
    if (hasImagesToDelete) {
      // Parse the imageIdsToDelete if it's a string (JSON)
      let imageIds: string[] = [];
      if (typeof imageIdsToDelete === 'string') {
        try {
          const parsed = JSON.parse(imageIdsToDelete);
          imageIds = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          imageIds = [imageIdsToDelete];
        }
      } else if (Array.isArray(imageIdsToDelete)) {
        imageIds = imageIdsToDelete;
      }

      // Verify all images belong to this product
      const imagesExist = await this.prisma.image.findMany({
        where: {
          id: { in: imageIds },
          productId: id
        }
      });

      if (imagesExist.length !== imageIds.length) {
        throw new BadRequestException('Một số hình ảnh không tồn tại hoặc không thuộc về sản phẩm này');
      }

      // Delete cloudinary images
      await Promise.all(imagesExist.map(img => this.cloudinaryQuery.deleteImage(img.url)));

      // Delete database records
      await this.productQuery.deleteImages(id, imageIds);
    }

    // Process new product images if uploaded
    if (hasProductImages && files?.productImages) {
      const productImages = files.productImages;

      // Upload the product images
      const imageUrls = await this.cloudinaryQuery.uploadImages(productImages);

      // Create new image records
      for (const imageUrl of imageUrls) {
        await this.prisma.image.create({
          data: {
            url: imageUrl,
            productId: id
          }
        });
      }
    }

    // Handle default image changes
    if (hasDefaultImage && files?.defaultImage) {
      const defaultImage = files.defaultImage[0];

      // Upload the default image
      const [defaultImageUrl] = await this.cloudinaryQuery.uploadImages([defaultImage]);

      // Create a new image record
      const newImage = await this.prisma.image.create({
        data: {
          url: defaultImageUrl,
          productId: id
        }
      });

      // Update the product's defaultImageId
      await this.productQuery.updateDefaultImage(id, newImage.id);
    }
    // If defaultImageId is specified in the DTO, update the default image reference
    else if (hasDefaultImageId) {
      // First verify that the image exists and belongs to this product
      const imageExists = await this.prisma.image.findFirst({
        where: {
          id: defaultImageId,
          productId: id
        }
      });

      if (!imageExists) {
        throw new BadRequestException('Hình ảnh không tồn tại hoặc không thuộc về sản phẩm này');
      }

      // Update the default image reference
      await this.productQuery.updateDefaultImage(id, defaultImageId);
    }

    // Update other product fields if any were provided
    if (hasProductUpdates) {
      await this.productQuery.update(id, productData);
    }

    // Get the final product state after all updates
    const updatedProduct = await this.productQuery.findOne(id);
    if (!updatedProduct) {
      throw new NotFoundException('Không thể tìm thấy sản phẩm sau khi cập nhật');
    }

    return new SuccessResponseDto('Cập nhật sản phẩm thành công', plainToInstance(ResProductDto, updatedProduct, { excludeExtraneousValues: true }));
  }

  @Patch(':id/images')
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'defaultImage', maxCount: 1 },
    { name: 'productImages', maxCount: 8 }
  ]))
  @ApiOperation({ summary: 'Cập nhật hình ảnh sản phẩm', description: 'Cập nhật danh sách hình ảnh của sản phẩm, bao gồm ảnh mặc định.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ReqUpdateProductImagesDto })
  @ApiResponse({ status: 200, description: 'Cập nhật hình ảnh thành công', type: SuccessResponseDto })
  async updateProductImages(
    @Param('id') id: string,
    @UploadedFiles() files: {
      defaultImage?: Express.Multer.File[],
      productImages?: Express.Multer.File[]
    },
    @Body() body: { defaultImageIndex?: number, keepExistingImages?: string },
  ) {
    // Find the product first
    const product = await this.productQuery.findOne(id);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    const productImages = files.productImages || [];
    const defaultImage = files.defaultImage && files.defaultImage.length > 0 ? files.defaultImage[0] : undefined;
    const keepExisting = body.keepExistingImages === 'true'; // Convert string to boolean

    // Check if at least one new image is provided when not keeping existing images
    if (!keepExisting && productImages.length === 0 && !defaultImage) {
      throw new BadRequestException('Ít nhất phải cung cấp một ảnh sản phẩm khi thay thế tất cả');
    }

    // Limit total number of images
    if (productImages.length > 8) {
      throw new BadRequestException('Tối đa 8 ảnh sản phẩm');
    }

    // Upload product images
    let productImageUrls: string[] = [];
    if (productImages.length > 0) {
      productImageUrls = await this.cloudinaryQuery.uploadImages(productImages);
    }

    // Upload default image if provided
    let defaultImageUrl: string | undefined;
    if (defaultImage) {
      const [uploadedUrl] = await this.cloudinaryQuery.uploadImages([defaultImage]);
      defaultImageUrl = uploadedUrl;
    }

    let updatedProduct;

    // Handle image updating strategy based on keepExisting flag
    if (keepExisting) {
      // Add new images to existing ones
      for (const imageUrl of productImageUrls) {
        await this.prisma.image.create({
          data: {
            url: imageUrl,
            productId: id
          }
        });
      }

      // If defaultImage was uploaded, add it too
      if (defaultImageUrl) {
        const newImage = await this.prisma.image.create({
          data: {
            url: defaultImageUrl,
            productId: id
          }
        });

        // Set as default if requested
        await this.productQuery.updateDefaultImage(id, newImage.id);
      } else if (body.defaultImageIndex !== undefined) {
        // Set an existing image as default based on index if specified
        const productImages = await this.prisma.image.findMany({ where: { productId: id } });
        if (productImages.length > body.defaultImageIndex) {
          await this.productQuery.updateDefaultImage(id, productImages[body.defaultImageIndex].id);
        }
      }
    } else {
      // Replace all images: first clear default image reference
      await this.prisma.product.update({
        where: { id },
        data: { defaultImageId: null }
      });

      // Delete all existing images
      await this.prisma.image.deleteMany({
        where: { productId: id }
      });

      // Add all new images
      for (const imageUrl of productImageUrls) {
        await this.prisma.image.create({
          data: {
            url: imageUrl,
            productId: id
          }
        });
      }

      // Add default image if provided
      if (defaultImageUrl) {
        const newImage = await this.prisma.image.create({
          data: {
            url: defaultImageUrl,
            productId: id
          }
        });

        await this.productQuery.updateDefaultImage(id, newImage.id);
      } else if (productImageUrls.length > 0) {
        // Use first uploaded image as default if no specific default image provided
        const newImages = await this.prisma.image.findMany({
          where: { productId: id }
        });

        if (newImages.length > 0) {
          const defaultIndex = body.defaultImageIndex !== undefined ?
            Math.min(body.defaultImageIndex, newImages.length - 1) : 0;

          await this.productQuery.updateDefaultImage(id, newImages[defaultIndex].id);
        }
      }
    }

    // Get the updated product to return in response
    updatedProduct = await this.productQuery.findOne(id);

    return new SuccessResponseDto('Cập nhật hình ảnh thành công', plainToInstance(ResProductDto, updatedProduct, { excludeExtraneousValues: true }));
  }

  @Patch(':id/default-image')
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('defaultImage', 1))
  @ApiOperation({ summary: 'Cập nhật ảnh mặc định của sản phẩm', description: 'Cập nhật chỉ ảnh mặc định của sản phẩm.' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Cập nhật ảnh mặc định thành công', type: SuccessResponseDto })
  async updateDefaultImage(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Phải cung cấp một ảnh mặc định');
    }

    const defaultImageFile = files[0];

    // Find the product first
    const product = await this.productQuery.findOne(id);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    // Upload the image to Cloudinary
    const [defaultImageUrl] = await this.cloudinaryQuery.uploadImages([defaultImageFile]);

    // First create a new image record
    const newImage = await this.prisma.image.create({
      data: {
        url: defaultImageUrl,
        productId: id
      }
    });

    // Then set it as the default image
    const updatedProduct = await this.productQuery.updateDefaultImage(id, newImage.id);

    return new SuccessResponseDto(
      'Cập nhật ảnh mặc định thành công',
      plainToInstance(ResProductDto, updatedProduct, { excludeExtraneousValues: true })
    );
  }

  @Patch(':id/set-default-image')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Đặt ảnh mặc định',
    description: 'Đặt một ảnh có sẵn làm ảnh mặc định của sản phẩm.'
  })
  @ApiBody({ type: ReqSetDefaultImageDto })
  @ApiResponse({ status: 200, description: 'Đặt ảnh mặc định thành công', type: SuccessResponseDto })
  async setDefaultImage(
    @Param('id') id: string,
    @Body() body: ReqSetDefaultImageDto,
  ) {
    // Find the product first
    const product = await this.productQuery.findOne(id);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    // Verify that the image exists and belongs to this product
    const imageExists = await this.prisma.image.findFirst({
      where: {
        id: body.imageId,
        productId: id
      }
    });

    if (!imageExists) {
      throw new BadRequestException('Hình ảnh không tồn tại hoặc không thuộc về sản phẩm này');
    }

    // Set the image as default
    const updatedProduct = await this.productQuery.updateDefaultImage(id, body.imageId);

    return new SuccessResponseDto(
      'Đặt ảnh mặc định thành công',
      plainToInstance(ResProductDto, updatedProduct, { excludeExtraneousValues: true })
    );
  }

  // ================= DELETE ENDPOINTS =================

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa sản phẩm', description: 'Xóa sản phẩm theo ID.' })
  async deleteProduct(@Param('id') id: string) {
    const data = await this.productQuery.delete(id);
    if (!data) throw new NotFoundException('Sản phẩm không tồn tại');
    return new SuccessResponseDto('Xóa sản phẩm thành công', null);
  }

  @Delete(':id/images')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xóa hình ảnh sản phẩm',
    description: 'Xóa một hoặc nhiều hình ảnh của sản phẩm.'
  })
  @ApiBody({ type: ReqDeleteImagesDto })
  @ApiResponse({ status: 200, description: 'Xóa hình ảnh thành công', type: SuccessResponseDto })
  async deleteProductImages(
    @Param('id') id: string,
    @Body() body: ReqDeleteImagesDto,
  ) {
    const product = await this.productQuery.findOne(id);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    const idsToDelete = body.imageIds?.length ? body.imageIds : body.imageId ? [body.imageId] : null;
    if (!idsToDelete || idsToDelete.length === 0) {
      throw new BadRequestException('Không có hình ảnh nào được cung cấp để xóa');
    }

    const imagesToDelete = product.images.filter(img => idsToDelete.includes(img.id));
    if (imagesToDelete.length === 0) {
      throw new NotFoundException('Không tìm thấy hình ảnh nào để xóa');
    }

    // Xóa khỏi Cloudinary
    await Promise.all(imagesToDelete.map(img => this.cloudinaryQuery.deleteImage(img.url)));

    // Xóa khỏi DB
    await this.productQuery.deleteImages(id, idsToDelete);

    return new SuccessResponseDto('Xóa hình ảnh thành công', null);
  }
}
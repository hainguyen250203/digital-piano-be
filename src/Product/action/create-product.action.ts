import { BrandQuery } from '@/Brand/queries/brand.query';
import { CloudinaryQuery } from '@/Cloudinary/queries/cloudinary.query';
import { ReqCreateProductDto } from '@/Product/api/dto/req-create-product.dto';
import { ProductQuery } from '@/Product/queries/product.query';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CreateProductAction {
  constructor(
    private readonly productQuery: ProductQuery,
    private readonly cloudinaryQuery: CloudinaryQuery,
    private readonly brandQuery: BrandQuery
  ) { }
  
  async execute(
    productImages: Express.Multer.File[], 
    defaultImage: Express.Multer.File | undefined,
    reqCreateProductDto: ReqCreateProductDto
  ) {
    try {
      // Validate brand
      const brand = await this.brandQuery.getBrandById(reqCreateProductDto.brandId);
      if (!brand) throw new BadRequestException('Không tìm thấy thương hiệu');
      
      // Check if product with same name exists
      const productExist = await this.productQuery.findOneByName(reqCreateProductDto.name);
      if (productExist) throw new BadRequestException('Sản phẩm đã tồn tại');
      
      // Upload all product images
      const productImageUrls = await this.cloudinaryQuery.uploadImages(productImages);
      
      // Upload default image if provided and add to all images
      let defaultImageUrl: string | undefined;
      let allImageUrls = [...productImageUrls];
      
      if (defaultImage) {
        const [uploadedDefaultImage] = await this.cloudinaryQuery.uploadImages([defaultImage]);
        defaultImageUrl = uploadedDefaultImage;
        
        // Add default image to the collection of all images
        allImageUrls.push(defaultImageUrl);
      } else if (reqCreateProductDto.defaultImageIndex !== undefined) {
        // Use an existing product image as default if index provided
        const index = reqCreateProductDto.defaultImageIndex;
        if (index >= 0 && index < productImageUrls.length) {
          defaultImageUrl = productImageUrls[index];
        }
      } else if (productImageUrls.length > 0) {
        // Default to first product image if no specific default image provided
        defaultImageUrl = productImageUrls[0];
      }
      
      // Create the product with all images
      const product = await this.productQuery.create(
        reqCreateProductDto.toCreateProductParam(allImageUrls, defaultImageUrl)
      );
      
      return product;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Sản phẩm đã tồn tại');
      }
      throw error;
    }
  }
}

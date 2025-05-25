import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as toStream from 'buffer-to-stream';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryQuery {
  private readonly logger = new Logger(CloudinaryQuery.name);
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');
    if (!cloudName || !apiKey || !apiSecret) throw new BadRequestException('Cloudinary configuration is missing in environment variables');
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  }
  async uploadImage(file: Express.Multer.File): Promise<any> {
    const mimetype = file.mimetype.split('/')[0];
    if (mimetype !== 'image') throw new BadRequestException('File type is not supported');
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'digitalPiano',
          public_id: `${Date.now()}`,
          format: 'jpg',
          overwrite: true
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadImages(imageFiles: Express.Multer.File[]): Promise<string[]> {
    const maxSize = 5 * 1024 * 1024;
    const uploadedImages: string[] = [];
    for (const file of imageFiles) {
      if (file.size > maxSize) throw new BadRequestException('File size exceeds the 5MB limit');
    }
    for (const file of imageFiles) {
      try {
        const result = await this.uploadImage(file);
        uploadedImages.push(result.secure_url);
      } catch (error) {
        this.logger.error(`Failed to upload image: ${error.message}`);
        throw new ServiceUnavailableException(`Failed to upload image: ${error.message}`);
      }
    }
    return uploadedImages;
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    const publicId = await this.extractPublicId(imageUrl);
    if (!publicId) throw new BadRequestException('Invalid image URL');
    const data = await cloudinary.uploader.destroy(publicId);
    if (data.result === 'not found') throw new Error('Image not found');
    if (data.result !== 'ok') return false;
    return true;
  }

  async deleteImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map(async url => {
      try {
        await this.deleteImage(url);
      } catch (error) {
        this.logger.error(`Failed to delete image ${url}: ${error.message}`);
      }
    });
    await Promise.all(deletePromises);
  }
  async extractPublicId(url: string): Promise<string | null> {
    const regex = /\/v\d+\/(.*?)(?=\.[a-zA-Z0-9]+$)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}

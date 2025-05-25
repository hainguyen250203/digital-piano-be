import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryQuery } from '@/Cloudinary/queries/cloudinary.query';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryQuery],
  exports: [CloudinaryQuery]
})
export class CloudinaryModule {}

import { CloudinaryQuery } from '@/Cloudinary/queries/cloudinary.query';
import { UpdateProfileParams } from '@/Profile/queries/dto/update-profile.params';
import { ProfileQuery } from '@/Profile/queries/profile.query';
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProfileUploadAvatarAction {
  private readonly logger = new Logger(ProfileUploadAvatarAction.name);
  constructor(
    private readonly profileQuery: ProfileQuery,
    private readonly cloudinaryService: CloudinaryQuery
  ) {}

  async execute(userId: string, file: Express.Multer.File) {
    try {
      const { secure_url } = await this.cloudinaryService.uploadImage(file);
      if (!secure_url) {
        this.logger.error('Cloudinary upload failed: No secure_url returned');
        throw new InternalServerErrorException('Failed to upload image');
      }
      const user = await this.profileQuery.getUserById(userId);
      if (!user) throw new NotFoundException('User not found');
      if (user.avatarUrl) {
        const isDeleted = await this.cloudinaryService.deleteImage(user.avatarUrl);
        if (!isDeleted) throw new InternalServerErrorException('Failed to delete old image');
      }
      const updateProfileParams: UpdateProfileParams = { userId, avatarUrl: secure_url };
      const updatedUserProfile = await this.profileQuery.updateUser(updateProfileParams);
      if (!updatedUserProfile) {
        this.logger.error('User update failed after uploading new avatar');
        throw new InternalServerErrorException('Failed to update user');
      }
      return updatedUserProfile;
    } catch (error) {
      this.logger.error(`Error in ProfileUploadAvatarAction.execute: ${error.message}`, error.stack);
      throw error;
    }
  }
} 
import { CloudinaryModule } from '@/Cloudinary/cloudinary.module';
import { PrismaModule } from '@/Prisma/prisma.module';
import { ProfileChangePasswordAction } from '@/Profile/actions/profile-change-password.action';
import { ProfileUpdateProfileAction } from '@/Profile/actions/profile-update-profile.action';
import { ProfileUploadAvatarAction } from '@/Profile/actions/profile-upload-avatar.action';
import { ProfileController } from '@/Profile/api/profile.controller';
import { ProfileQuery } from '@/Profile/queries/profile.query';
import { Module } from '@nestjs/common';
@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProfileController],
  providers: [ProfileQuery, ProfileUploadAvatarAction, ProfileUpdateProfileAction, ProfileChangePasswordAction],
  exports: [ProfileQuery, ProfileUploadAvatarAction, ProfileUpdateProfileAction, ProfileChangePasswordAction]
})
export class ProfileModule { } 
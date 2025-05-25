import { PrismaModule } from '@/Prisma/prisma.module';
import { UserController } from '@/User/api/user.controller';
import { UserQuery } from '@/User/queries/user.query';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserQuery],
  exports: [UserQuery]
})
export class UserModule { } 
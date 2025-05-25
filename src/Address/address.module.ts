import { CreateAddressAction } from '@/Address/action/create-address.action';
import { AddressQuery } from '@/Address/queries/address.query';
import { AddressController } from '@/Address/api/address.controller';

import { PrismaModule } from '@/Prisma/prisma.module';
import { PrismaService } from '@/Prisma/prisma.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [AddressController],
  providers: [CreateAddressAction, AddressQuery, PrismaService],
  exports: [CreateAddressAction, AddressQuery]
})
export class AddressModule { } 
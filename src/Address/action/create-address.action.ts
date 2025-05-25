import { AddressQuery } from '@/Address/queries/address.query';
import { Injectable, Logger } from '@nestjs/common';
import { Address } from '@prisma/client';
import { CreateAddressParams } from '../queries/dto/create-address.params';

@Injectable()
export class CreateAddressAction {
  private readonly logger = new Logger(CreateAddressAction.name);

  constructor(private readonly addressQuery: AddressQuery) {}

  async execute(params: CreateAddressParams): Promise<Address> {
    try {
      return await this.addressQuery.create(params);
    } catch (error) {
      this.logger.error(`Lỗi khi tạo địa chỉ: ${error.message}`, error.stack);
      throw error;
    }
  }
} 
import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Address } from '@prisma/client';
import { CreateAddressParams } from './dto/create-address.params';
import { GetAddressesParams } from './dto/get-addresses.params';
import { UpdateAddressParams } from './dto/update-address.params';

@Injectable()
export class AddressQuery {
  private readonly logger = new Logger(AddressQuery.name);

  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<Address | null> {
    try {
      return await this.prisma.address.findUnique({
        where: { id, isDeleted: false }
      });
    } catch (error) {
      this.logger.error(`Lỗi khi tìm địa chỉ theo ID: ${error.message}`, error.stack);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<Address[]> {
    try {
      return await this.prisma.address.findMany({
        where: { userId, isDeleted: false },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      this.logger.error(`Lỗi khi tìm địa chỉ theo ID người dùng: ${error.message}`, error.stack);
      return [];
    }
  }

  async findAll({ userId, isDeleted = false }: GetAddressesParams): Promise<Address[]> {
    try {
      return await this.prisma.address.findMany({
        where: { userId, isDeleted },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      this.logger.error(`Lỗi khi tìm tất cả địa chỉ: ${error.message}`, error.stack);
      return [];
    }
  }

  async create(params: CreateAddressParams): Promise<Address> {
    try {
      // If isDefault is true, reset all other addresses to isDefault = false
      if (params.isDefault) {
        await this.prisma.address.updateMany({
          where: { userId: params.userId, isDeleted: false },
          data: { isDefault: false }
        });
      }

      return await this.prisma.address.create({
        data: params
      });
    } catch (error) {
      this.logger.error(`Lỗi khi tạo địa chỉ: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update({ id, userId, ...data }: UpdateAddressParams): Promise<Address> {
    try {
      const address = await this.prisma.address.findUnique({
        where: { id, isDeleted: false }
      });

      if (!address) {
        throw new NotFoundException('Không tìm thấy địa chỉ');
      }

      // If setting this address as default, reset all other addresses
      if (data.isDefault) {
        await this.prisma.address.updateMany({
          where: { userId, isDeleted: false, id: { not: id } },
          data: { isDefault: false }
        });
      }

      return await this.prisma.address.update({
        where: { id },
        data
      });
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật địa chỉ: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<Address> {
    try {
      const address = await this.prisma.address.findUnique({
        where: { id, isDeleted: false }
      });

      if (!address) {
        throw new NotFoundException('Không tìm thấy địa chỉ');
      }

      return await this.prisma.address.update({
        where: { id },
        data: { isDeleted: true }
      });
    } catch (error) {
      this.logger.error(`Lỗi khi xóa địa chỉ: ${error.message}`, error.stack);
      throw error;
    }
  }

  async setAsDefault(id: string, userId: string): Promise<Address> {
    try {
      const address = await this.prisma.address.findUnique({
        where: { id, isDeleted: false }
      });

      if (!address) {
        throw new NotFoundException('Không tìm thấy địa chỉ');
      }

      // Reset all addresses for this user
      await this.prisma.address.updateMany({
        where: { userId, isDeleted: false },
        data: { isDefault: false }
      });

      // Set this one as default
      return await this.prisma.address.update({
        where: { id },
        data: { isDefault: true }
      });
    } catch (error) {
      this.logger.error(`Lỗi khi đặt địa chỉ mặc định: ${error.message}`, error.stack);
      throw error;
    }
  }
} 
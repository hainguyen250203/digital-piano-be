import { PrismaService } from '@/Prisma/prisma.service';
import { CreateSupplierParams } from '@/Supplier/queries/dto/create-supplier.params';
import { updateSupplierParams } from '@/Supplier/queries/dto/update-supplier.params';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SupplierQuery {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSupplierParams: CreateSupplierParams) {
    return await this.prisma.supplier.create({ data: { ...createSupplierParams } });
  }
  async findAll() {
    return await this.prisma.supplier.findMany();
  }
  async findOne(id: string) {
    return await this.prisma.supplier.findUnique({ where: { id }, include: { invoices: true } });
  }
  async update(updateSupplierParams: updateSupplierParams) {
    const { id, ...data } = updateSupplierParams;
    return await this.prisma.supplier.update({ where: { id }, data });
  }

  async delete(id: string) {
    return await this.prisma.supplier.update({ where: { id }, data: { isDeleted: true } });
  }
}

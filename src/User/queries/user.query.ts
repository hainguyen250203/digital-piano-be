import { SortOrder } from '@/Common/dto/get-query.dto';
import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class UserQuery {
  constructor(private readonly prisma: PrismaService) { }

  async getUsers(skip?: number, take?: number, sort: SortOrder = SortOrder.DESC) {
    return await this.prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: sort },
    });
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async updateUserRole(id: string, role: Role) {
    return await this.prisma.user.update({
      where: { id },
      data: { role }
    });
  }

  async updateUserBlockStatus(id: string, isBlock: boolean) {
    return await this.prisma.user.update({
      where: { id },
      data: { isBlock }
    });
  }

  async deleteUser(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  async restoreUser(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { isDeleted: false }
    });
  }
} 
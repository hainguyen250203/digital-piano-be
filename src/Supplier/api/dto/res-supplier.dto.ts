import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from '@prisma/client';
import { Expose } from 'class-transformer';

export class ResSupplierDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email?: string;

  @ApiProperty()
  @Expose()
  phoneNumber?: string;

  @ApiProperty()
  @Expose()
  address?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  isDeleted?: boolean;

  @ApiProperty()
  @Expose()
  invoices?: Invoice[];

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

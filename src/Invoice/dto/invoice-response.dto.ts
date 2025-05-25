import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

// Product data in response
export class ProductResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;
}

// Supplier data in response
export class SupplierResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;
}

// Invoice item data in response
export class InvoiceItemResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  invoiceId: string;

  @Expose()
  @ApiProperty()
  productId: string;

  @Expose()
  @ApiProperty()
  quantity: number;

  @Expose()
  @ApiProperty()
  importPrice: number;

  @Expose()
  @ApiProperty()
  subtotal: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty({ type: ProductResponseDto })
  @Type(() => ProductResponseDto)
  product: ProductResponseDto;
}

// Full invoice data in response
export class InvoiceResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  supplierId: string;

  @Expose()
  @ApiProperty()
  totalAmount: number;

  @Expose()
  @ApiPropertyOptional()
  note?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty({ type: SupplierResponseDto })
  @Type(() => SupplierResponseDto)
  supplier: SupplierResponseDto;

  @Expose()
  @ApiProperty({ type: [InvoiceItemResponseDto] })
  @Type(() => InvoiceItemResponseDto)
  items: InvoiceItemResponseDto[];
}

// List of invoices in response with pagination metadata
export class InvoiceListResponseDto {
  @Expose()
  @ApiProperty({ type: [InvoiceResponseDto] })
  @Type(() => InvoiceResponseDto)
  data: InvoiceResponseDto[];

  @Expose()
  @ApiProperty()
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} 
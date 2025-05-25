import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { Expose } from 'class-transformer';

// Query Parameters DTO for database operations
export class DiscountQueryParamsDto {
  page?: number;
  limit?: number;
}

// DTO for creating a discount in the database
export class DiscountCreateDto {
  code: string;
  description?: string;
  discountType: DiscountType;
  value: number;
  startDate?: Date;
  endDate?: Date;
  maxUses?: number;
  minOrderTotal?: number;
  maxDiscountValue?: number;
  isActive?: boolean;
}

// DTO for updating a discount in the database
export class DiscountUpdateDto {
  code?: string;
  description?: string;
  discountType?: DiscountType;
  value?: number;
  startDate?: Date;
  endDate?: Date;
  maxUses?: number;
  minOrderTotal?: number;
  maxDiscountValue?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  usedCount?: number;
}


// DTO for validating a discount code
export class ValidateDiscountDto {
  code: string;
  orderTotal: number;
}

// DTO for discount validation result
export class DiscountValidationResultDto {
  @Expose()
  @ApiProperty()
  isValid: boolean;

  @Expose()
  @ApiPropertyOptional()
  discount?: {
    id: string;
    code: string;
    discountType: DiscountType;
    value: number;
    maxDiscountValue?: number;
  };
  discountAmount?: number;
  message?: string;
} 
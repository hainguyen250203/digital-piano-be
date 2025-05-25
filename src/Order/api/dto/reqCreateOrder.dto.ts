import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReqCreateOrderDto {
  @IsUUID()
  addressId: string;

  @IsString()
  @IsOptional()
  discountCode?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  note?: string;
} 
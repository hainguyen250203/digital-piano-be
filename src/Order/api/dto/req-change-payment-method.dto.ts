import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ReqChangePaymentMethodDto {
  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  paymentMethod: PaymentMethod;
}
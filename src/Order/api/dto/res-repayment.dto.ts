import { ApiProperty } from '@nestjs/swagger';

export class ResRepaymentDto {
  @ApiProperty({ description: 'URL thanh toán' })
  paymentUrl: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyReturnUrlDto {
  @ApiProperty({ description: 'Amount of the transaction' })
  @IsNotEmpty()
  @IsString()
  vnp_Amount: string;

  @ApiProperty({ description: 'Bank code used for payment' })
  @IsNotEmpty()
  @IsString()
  vnp_BankCode: string;

  @ApiProperty({ description: 'Bank transaction number' })
  @IsNotEmpty()
  @IsString()
  vnp_BankTranNo: string;

  @ApiProperty({ description: 'Type of card used' })
  @IsNotEmpty()
  @IsString()
  vnp_CardType: string;

  @ApiProperty({ description: 'Order information' })
  @IsNotEmpty()
  @IsString()
  vnp_OrderInfo: string;

  @ApiProperty({ description: 'Payment date' })
  @IsNotEmpty()
  @IsString()
  vnp_PayDate: string;

  @ApiProperty({ description: 'Response code from VNPay' })
  @IsNotEmpty()
  @IsString()
  vnp_ResponseCode: string;

  @ApiProperty({ description: 'VNPay merchant code' })
  @IsNotEmpty()
  @IsString()
  vnp_TmnCode: string;

  @ApiProperty({ description: 'VNPay transaction number' })
  @IsNotEmpty()
  @IsString()
  vnp_TransactionNo: string;

  @ApiProperty({ description: 'Transaction status' })
  @IsNotEmpty()
  @IsString()
  vnp_TransactionStatus: string;

  @ApiProperty({ description: 'Transaction reference' })
  @IsNotEmpty()
  @IsString()
  vnp_TxnRef: string;

  @ApiProperty({ description: 'Secure hash for verification' })
  @IsNotEmpty()
  @IsString()
  vnp_SecureHash: string;
}
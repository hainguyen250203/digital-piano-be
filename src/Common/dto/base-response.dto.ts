import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty()
  message: string;
  @ApiProperty()
  errorCode: number;
  @ApiProperty()
  data: T | null;

  constructor(message: string, errorCode: number, data: T | null) {
    this.message = message;
    this.errorCode = errorCode;
    this.data = data;
  }
}

export class SuccessResponseDto<T> extends BaseResponseDto<T> {
  constructor(message: string, data: T) {
    super(message, 0, data);
  }
}

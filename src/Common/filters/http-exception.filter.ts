import { TelegramLogger, TelegramOption } from '@/Common/utils/telegram-logger';
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { BaseResponseDto } from '../dto/base-response.dto';

@Catch()
export class GlobalGrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalGrpcExceptionFilter.name);

  private readonly telegramOption: TelegramOption;
  constructor(private readonly configService: ConfigService) {
    const botToken = this.configService.get<string>('telegram.botToken');
    const chatId = this.configService.get<string>('telegram.chatId');
    if (!botToken || !chatId) throw new Error('Telegram bot token or chat ID is not configured');
    this.telegramOption = {
      botToken,
      chatId
    };
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let errorMessage = 'The system is busy, please try again later';
    let errorCode = 5;

    if (exception instanceof BadRequestException) {
      const responseData = exception.getResponse();
      if (typeof responseData === 'object' && responseData !== null) {
        const message = Array.isArray(responseData['message']) ? responseData['message'][0] : responseData['message'];
        errorMessage = typeof message === 'string' ? message : errorMessage;
      }
      errorCode = 3;
      status = exception.getStatus();
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseData = exception.getResponse();
      if (typeof responseData === 'object' && responseData !== null) {
        errorMessage = (responseData as any).message || exception.message;
      } else {
        errorMessage = exception.message;
      }
      errorCode = 4;
    } else if (exception instanceof Error) {
      this.logger.error(`System Error: ${exception.message}`, exception.stack);

      // Gửi lỗi lên Telegram nếu môi trường là production
      if (this.configService.get<string>('NODE_ENV') === 'PRODUCTION') {
        TelegramLogger({
          message: exception.message,
          stack: exception.stack,
          telegramOption: this.telegramOption,
          context: {
            filter: GlobalGrpcExceptionFilter.name
          }
        });
      }

      errorMessage = 'The system is busy, please try again later';
      errorCode = 5;
      status = 500;
    }

    const errorResponse: BaseResponseDto<null> = {
      message: errorMessage,
      errorCode,
      data: null
    };

    response.status(status).json(errorResponse);
  }
}

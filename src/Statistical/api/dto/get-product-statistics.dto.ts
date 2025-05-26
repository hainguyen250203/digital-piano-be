import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TimePeriod } from './get-sales-statistics.dto';

export class GetProductStatisticsDto {
  @ApiProperty({ 
    required: false, 
    enum: TimePeriod, 
    description: 'Khoảng thời gian thống kê (ngày, tuần, tháng, năm)'
  })
  @IsEnum(TimePeriod)
  @IsOptional()
  period?: TimePeriod;

  @ApiProperty({ 
    required: false,
    description: 'Ngày bắt đầu thống kê (định dạng ISO)',
    example: '2023-01-01'
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ 
    required: false,
    description: 'Ngày kết thúc thống kê (định dạng ISO)',
    example: '2023-12-31'
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
} 
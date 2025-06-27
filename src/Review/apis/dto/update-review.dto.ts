import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsNumber({}, { message: 'Rating phải là số' })
  @Min(1)
  @Max(5)

  rating?: number;

  @IsOptional()
  @IsString({ message: 'Nội dung phải là chuỗi' } )
  content?: string;
} 
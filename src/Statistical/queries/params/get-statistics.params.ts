import { TimePeriod } from '../../api/dto/get-sales-statistics.dto';
import { StockSortType } from '../../api/dto/get-stock-statistics.dto';

export interface GetTimeRangeStatisticsParams {
  period?: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}

export interface GetProductStatisticsParams extends GetTimeRangeStatisticsParams {
}

export interface GetStockStatisticsParams {
  sortBy?: StockSortType;
} 
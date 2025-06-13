import * as dayjs from 'dayjs';
import { DateCount, StatusCount } from '../types/statistics.types';

export const formatDate = (date: Date): string => {
  return dayjs(date).format('DD-MM-YYYY');
};

export const formatDateTime = (date: Date): string => {
  return dayjs(date).format('DD-MM-YYYY HH:mm:ss');
};

export const groupByDate = <T extends { createdAt: Date }>(
  items: T[],
  countField: keyof T = '_count' as keyof T,
): DateCount[] => {
  return Object.values(
    items.reduce((acc, item) => {
      const date = formatDate(item.createdAt);
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count += Number(item[countField] || 1);
      return acc;
    }, {} as Record<string, DateCount>)
  );
};

export const formatStatusData = <T extends { [key: string]: any }>(
  data: T[],
  statusField: keyof T,
  countField: keyof T = '_count' as keyof T,
): StatusCount[] => {
  return data.map(item => ({
    status: item[statusField],
    count: Number(item[countField] || 0),
  }));
};

export const calculateTotal = (items: { [key: string]: number }[]): number => {
  return items.reduce((sum, item) => {
    return sum + Object.values(item).reduce((itemSum, value) => {
      return itemSum + (typeof value === 'number' ? value : 0);
    }, 0);
  }, 0);
};

export const sortByValue = <T extends { [key: string]: any }>(
  items: T[],
  valueField: keyof T,
  descending = true
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = Number(a[valueField] || 0);
    const bValue = Number(b[valueField] || 0);
    return descending ? bValue - aValue : aValue - bValue;
  });
};

export const takeTop = <T>(items: T[], limit: number): T[] => {
  return items.slice(0, limit);
}; 
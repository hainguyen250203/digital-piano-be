import { ReturnStatus } from '@prisma/client';

export function mapReturnStatusToVietnamese(status: ReturnStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý';
    case 'APPROVED':
      return 'Đã duyệt';
    case 'REJECTED':
      return 'Từ chối';
    case 'COMPLETED':
      return 'Hoàn thành';
    default:
      return status;
  }
} 
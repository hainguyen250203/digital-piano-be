import { ChangeType, OrderStatus, PaymentStatus } from '@prisma/client';

export interface DateCount {
  date: string;
  count: number;
}

export interface DateValue {
  date: string;
  value: number;
}

export interface StatusCount {
  status: OrderStatus | PaymentStatus | ChangeType;
  count: number;
}

export interface CustomerStats {
  id: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  orderCount?: number;
  totalSpending?: number;
}

export interface ProductStats {
  productId: string;
  productName: string;
  quantity: number;
  value?: number;
  averagePrice?: number;
}

export interface StockMovementStats {
  recentChanges: {
    id: string;
    productId: string;
    productName: string;
    changeType: ChangeType;
    change: number;
    createdAt: string;
    referenceType: string | null;
    referenceId: string | null;
    note: string | null;
  }[];
  changeTypeSummary: {
    import: number;
    sale: number;
    return: number;
    cancel: number;
    adjustment: number;
  };
}

export interface ImportValueStats {
  totalImportValue: number;
  totalImportQuantity: number;
  totalSalesQuantity: number;
  totalReturnsQuantity: number;
  recentInvoices: {
    id: string;
    supplierId: string;
    supplierName: string;
    totalAmount: number;
    createdAt: string;
  }[];
  topProductsByImportValue: ProductStats[];
}

export interface RevenueStats {
  revenueByDate: Record<string, any>[];
  totalRevenue: number;
}

export interface SalesStats {
  ordersByStatus: StatusCount[];
  ordersByPaymentStatus: StatusCount[];
  ordersByDate: DateCount[];
  totalOrders: number;
}

export interface UserStats {
  totalNewUsers: number;
  newUsersByDate: DateCount[];
  totalActiveUsers: number;
  topCustomersByOrderCount: CustomerStats[];
  topCustomersBySpending: CustomerStats[];
}

export interface StockStats {
  stockLevels: {
    stockId: string;
    productId: string;
    productName: string;
    quantity: number;
    subCategoryId: string;
    subCategoryName: string;
    categoryId: string;
    categoryName: string;
  }[];
  stockMovement: StockMovementStats;
  outOfStockProducts: any[];
  lowStockProducts: any[];
  importValueData: ImportValueStats;
  stockSummary: {
    outOfStockCount: number;
    lowStockCount: number;
  };
} 
export interface UpdateAddressParams {
  id: string;
  userId: string;
  fullName?: string;
  phone?: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  isDefault?: boolean;
} 
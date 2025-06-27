export class ReviewResponseDto {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    avatarUrl: string | null;
  };
} 
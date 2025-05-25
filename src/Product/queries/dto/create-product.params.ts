import { JsonObject } from '@prisma/client/runtime/library';

export type CreateProductQueryParams = {
  name: string
  description: JsonObject
  price: number
  salePrice?: number
  videoUrl?: string
  isHotSale?: boolean
  isFeatured?: boolean
  subCategoryId: string
  productTypeId?: string
  brandId?: string
  images: string[]
  defaultImageUrl?: string
}

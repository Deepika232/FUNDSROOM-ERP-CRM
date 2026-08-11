import { Product } from "@prisma/client";

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductWithRelations extends Product {
  _count?: {
    stockMovements: number;
    challanItems: number;
  };
}

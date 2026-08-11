export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: number;
  minimumStockAlertQuantity: number;
  warehouseLocation: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    stockMovements: number;
    challanItems: number;
  };
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductCreateInput {
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minimumStockAlertQuantity?: number;
  warehouseLocation?: string | null;
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {}

export interface ProductQuery {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

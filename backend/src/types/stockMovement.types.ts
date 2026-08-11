import { StockMovement } from "@prisma/client";

export interface StockMovementWithRelations extends StockMovement {
  product?: {
    id: string;
    productName: string;
    sku: string;
    category: string;
    warehouseLocation: string | null;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StockMovementListResponse {
  stockMovements: StockMovementWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

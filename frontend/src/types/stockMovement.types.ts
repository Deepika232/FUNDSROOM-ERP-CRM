export type MovementType = "IN" | "OUT";

export interface ProductStub {
  id: string;
  productName: string;
  sku: string;
  category: string;
  warehouseLocation: string | null;
}

export interface UserStub {
  id: string;
  name: string;
  email: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdAt: string;
  product?: ProductStub;
  createdBy?: UserStub;
}

export interface StockMovementListResponse {
  stockMovements: StockMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StockMovementCreateInput {
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
}

export interface StockMovementQuery {
  search?: string;
  productId?: string;
  movementType?: MovementType;
  category?: string;
  page?: number;
  limit?: number;
}

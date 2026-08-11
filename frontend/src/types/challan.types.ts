export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
export type MovementType = "IN" | "OUT";

export interface CustomerStub {
  id: string;
  customerName: string;
  mobileNumber: string;
  businessName: string | null;
}

export interface UserStub {
  id: string;
  name: string;
  email: string;
}

export interface ProductStubForChallan {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: number;
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  createdAt: string;
  product?: ProductStubForChallan;
}

export interface ChallanItemInput {
  productId: string;
  quantity: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  status: ChallanStatus;
  totalQuantity: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerStub;
  createdBy?: UserStub;
  items?: ChallanItem[];
}

export interface ChallanListResponse {
  challans: Challan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChallanCreateInput {
  customerId: string;
  items: ChallanItemInput[];
}

export interface ChallanUpdateInput {
  customerId?: string;
  items?: ChallanItemInput[];
}

export interface ChallanQuery {
  search?: string;
  customerId?: string;
  status?: ChallanStatus;
  page?: number;
  limit?: number;
}

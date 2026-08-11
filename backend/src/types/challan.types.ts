import { Challan, ChallanItem } from "@prisma/client";

export interface ChallanItemWithProduct extends Omit<ChallanItem, "unitPriceSnapshot"> {
  unitPriceSnapshot: any;
  product?: {
    id: string;
    productName: string;
    sku: string;
    category: string;
    unitPrice: any;
    currentStock: number;
  };
}

export interface ChallanWithRelations extends Challan {
  customer?: {
    id: string;
    customerName: string;
    mobileNumber: string;
    businessName: string | null;
  };
  createdBy?: {
      id: string;
      name: string;
      email: string;
    };
  items?: ChallanItemWithProduct[];
}

export interface ChallanListResponse {
  challans: ChallanWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

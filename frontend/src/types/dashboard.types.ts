import type { ChallanStatus } from "./challan.types";
import type { MovementType } from "./stockMovement.types";

export interface LowStockProduct {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStockAlertQuantity: number;
  unitPrice: number;
}

export interface DashboardRecentCustomerStub {
  id: string;
  customerName: string;
  mobileNumber: string;
  businessName: string | null;
}

export interface DashboardRecentProductStub {
  id: string;
  productName: string;
  sku: string;
}

export interface RecentChallan {
  id: string;
  challanNumber: string;
  status: ChallanStatus;
  totalQuantity: number;
  createdAt: string;
  customer: DashboardRecentCustomerStub | null;
}

export interface RecentStockMovement {
  id: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdAt: string;
  product: DashboardRecentProductStub | null;
}

export interface DashboardSummary {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  lowStockProductCount: number;
  totalStockQuantity: number;
  draftChallans: number;
  confirmedChallans: number;
  cancelledChallans: number;
  lowStockProducts: LowStockProduct[];
  recentChallans: RecentChallan[];
  recentStockMovements: RecentStockMovement[];
  generatedAt: string;
}

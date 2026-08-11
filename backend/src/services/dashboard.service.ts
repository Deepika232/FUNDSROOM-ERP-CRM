import { ChallanStatus, CustomerStatus, MovementType } from "@prisma/client";
import { prisma } from "../config/database";

export interface LowStockProduct {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStockAlertQuantity: number;
  unitPrice: number;
}

export interface RecentChallan {
  id: string;
  challanNumber: string;
  status: ChallanStatus;
  totalQuantity: number;
  createdAt: Date;
  customer: {
    id: string;
    customerName: string;
    mobileNumber: string;
    businessName: string | null;
  } | null;
}

export interface RecentStockMovement {
  id: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdAt: Date;
  product: {
    id: string;
    productName: string;
    sku: string;
  } | null;
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
  generatedAt: Date;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const RECENT_LIMIT = 8;
  const LOW_STOCK_LIMIT = 10;

  const [
    totalCustomersResult,
    activeCustomersResult,
    totalProductsResult,
    lowStockCountResult,
    totalStockResult,
    draftChallansResult,
    confirmedChallansResult,
    cancelledChallansResult,
    lowStockProductsResult,
    recentChallansResult,
    recentStockMovementsResult,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
    prisma.product.count(),
    prisma.product.count({
      where: {
        currentStock: { lte: prisma.product.fields.minimumStockAlertQuantity },
      },
    }),
    prisma.product.aggregate({
      _sum: { currentStock: true },
    }),
    prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
    prisma.challan.count({ where: { status: ChallanStatus.CONFIRMED } }),
    prisma.challan.count({ where: { status: ChallanStatus.CANCELLED } }),
    prisma.product.findMany({
      where: {
        currentStock: { lte: prisma.product.fields.minimumStockAlertQuantity },
      },
      orderBy: [{ currentStock: "asc" }, { updatedAt: "desc" }],
      take: LOW_STOCK_LIMIT,
      select: {
        id: true,
        productName: true,
        sku: true,
        category: true,
        currentStock: true,
        minimumStockAlertQuantity: true,
        unitPrice: true,
      },
    }),
    prisma.challan.findMany({
      take: RECENT_LIMIT,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        challanNumber: true,
        status: true,
        totalQuantity: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            customerName: true,
            mobileNumber: true,
            businessName: true,
          },
        },
      },
    }),
    prisma.stockMovement.findMany({
      take: RECENT_LIMIT,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        quantityChanged: true,
        movementType: true,
        reason: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            productName: true,
            sku: true,
          },
        },
      },
    }),
  ]);

  const lowStockProducts: LowStockProduct[] = lowStockProductsResult.map((p) => ({
    ...p,
    unitPrice: Number(p.unitPrice),
  }));

  const recentChallans: RecentChallan[] = recentChallansResult.map((ch) => ({
    ...ch,
    customer: ch.customer,
  }));

  const recentStockMovements: RecentStockMovement[] = recentStockMovementsResult.map((m) => ({
    ...m,
    product: m.product,
  }));

  return {
    totalCustomers: totalCustomersResult,
    activeCustomers: activeCustomersResult,
    totalProducts: totalProductsResult,
    lowStockProductCount: lowStockCountResult,
    totalStockQuantity: totalStockResult._sum.currentStock ?? 0,
    draftChallans: draftChallansResult,
    confirmedChallans: confirmedChallansResult,
    cancelledChallans: cancelledChallansResult,
    lowStockProducts,
    recentChallans,
    recentStockMovements,
    generatedAt: new Date(),
  };
}

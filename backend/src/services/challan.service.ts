import { ChallanStatus, MovementType, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import {
  ChallanQuery,
  CreateChallanInput,
  UpdateChallanInput,
} from "../utils/challan.validation";
import {
  ChallanListResponse,
  ChallanWithRelations,
} from "../types/challan.types";

function generateChallanNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CHL-${yyyy}${mm}-${rand}`;
}

async function generateUniqueChallanNumber(tx: Prisma.TransactionClient = prisma as any): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateChallanNumber();
    const existing = await tx.challan.findUnique({ where: { challanNumber: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  throw new AppError("Failed to generate a unique challan number — please retry", 500);
}

const challanDetailInclude = {
  customer: {
    select: {
      id: true,
      customerName: true,
      mobileNumber: true,
      businessName: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          productName: true,
          sku: true,
          category: true,
          unitPrice: true,
          currentStock: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function getChallans(query: ChallanQuery): Promise<ChallanListResponse> {
  const { search, customerId, status, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ChallanWhereInput = {};

  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  if (search) {
    where.OR = [
      { challanNumber: { contains: search, mode: "insensitive" } },
      {
        customer: {
          OR: [
            { customerName: { contains: search, mode: "insensitive" } },
            { mobileNumber: { contains: search, mode: "insensitive" } },
            { businessName: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const listInclude = {
    customer: { select: { id: true, customerName: true, mobileNumber: true, businessName: true } },
    createdBy: { select: { id: true, name: true, email: true } },
  };

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      include: listInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" as const },
    }) as Promise<ChallanWithRelations[]>,
    prisma.challan.count({ where }),
  ]);

  return {
    challans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getChallanById(id: string): Promise<ChallanWithRelations> {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: challanDetailInclude,
  });

  if (!challan) {
    throw new AppError("Challan not found", 404);
  }

  return challan as ChallanWithRelations;
}

export async function createChallan(
  input: CreateChallanInput,
  createdById: string,
): Promise<ChallanWithRelations> {
  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: input.customerId },
      select: { id: true },
    });
    if (!customer) throw new AppError("Customer not found", 404);

    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, productName: true, sku: true, unitPrice: true },
    });
    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = productIds.filter((pid) => !found.has(pid));
      throw new AppError(`Product(s) not found: ${missing.join(", ")}`, 404);
    }
    const productMap = new Map(products.map((p) => [p.id, p]));

    const challanNumber = await generateUniqueChallanNumber(tx as any);
    const totalQuantity = input.items.reduce((sum, it) => sum + it.quantity, 0);

    const challan = await tx.challan.create({
      data: {
        challanNumber,
        customerId: input.customerId,
        status: ChallanStatus.DRAFT,
        totalQuantity,
        createdById,
        items: {
          create: input.items.map((it) => {
            const p = productMap.get(it.productId)!;
            return {
              productId: it.productId,
              productNameSnapshot: p.productName,
              skuSnapshot: p.sku,
              unitPriceSnapshot: p.unitPrice,
              quantity: it.quantity,
            };
          }),
        },
      },
      include: challanDetailInclude,
    });

    return challan;
  });

  return result as ChallanWithRelations;
}

export async function updateChallan(
  id: string,
  input: UpdateChallanInput,
): Promise<ChallanWithRelations> {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.challan.findUnique({ where: { id }, include: { items: true } });
    if (!existing) throw new AppError("Challan not found", 404);

    if (existing.status !== ChallanStatus.DRAFT) {
      throw new AppError(
        `Cannot update challan with status "${existing.status}". Only DRAFT challans may be edited.`,
        400,
      );
    }

    const nextCustomerId = input.customerId ?? existing.customerId;
    if (input.customerId) {
      const customer = await tx.customer.findUnique({ where: { id: input.customerId }, select: { id: true } });
      if (!customer) throw new AppError("Customer not found", 404);
    }

    let itemsInput = input.items;
    let finalItems = existing.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    if (itemsInput) {
      finalItems = itemsInput;
      const productIds = itemsInput.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      if (products.length !== productIds.length) {
        const found = new Set(products.map((p) => p.id));
        const missing = productIds.filter((pid) => !found.has(pid));
        throw new AppError(`Product(s) not found: ${missing.join(", ")}`, 404);
      }
    }

    const productIds2 = finalItems.map((i) => i.productId);
    const productsFull = await tx.product.findMany({
      where: { id: { in: productIds2 } },
      select: { id: true, productName: true, sku: true, unitPrice: true },
    });
    const productMap = new Map(productsFull.map((p) => [p.id, p]));
    const totalQuantity = finalItems.reduce((sum, it) => sum + it.quantity, 0);

    const updated = await tx.challan.update({
      where: { id },
      data: {
        customerId: nextCustomerId,
        totalQuantity,
        items: {
          deleteMany: {},
          create: finalItems.map((it) => {
            const p = productMap.get(it.productId)!;
            return {
              productId: it.productId,
              productNameSnapshot: p.productName,
              skuSnapshot: p.sku,
              unitPriceSnapshot: p.unitPrice,
              quantity: it.quantity,
            };
          }),
        },
      },
      include: challanDetailInclude,
    });

    return updated;
  });

  return result as ChallanWithRelations;
}

export async function confirmChallan(
  id: string,
  confirmedById: string,
): Promise<ChallanWithRelations> {
  const result = await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!challan) throw new AppError("Challan not found", 404);

    if (challan.status === ChallanStatus.CONFIRMED) {
      throw new AppError("Challan is already confirmed", 400);
    }
    if (challan.status === ChallanStatus.CANCELLED) {
      throw new AppError("Cannot confirm a cancelled challan", 400);
    }
    if (challan.status !== ChallanStatus.DRAFT) {
      throw new AppError(`Cannot confirm challan with status "${challan.status}"`, 400);
    }
    if (challan.items.length === 0) {
      throw new AppError("Cannot confirm challan — it has no items", 400);
    }

    const productIds = challan.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, productName: true, currentStock: true },
    });
    const productStockMap = new Map(products.map((p) => [p.id, p]));

    const insufficient: string[] = [];
    for (const item of challan.items) {
      const p = productStockMap.get(item.productId);
      if (!p) {
        insufficient.push(`Product #${item.productId} no longer exists`);
        continue;
      }
      if (p.currentStock < item.quantity) {
        insufficient.push(
          `"${p.productName}" has ${p.currentStock} units, challan requires ${item.quantity}`,
        );
      }
    }

    if (insufficient.length > 0) {
      throw new AppError(
        `Insufficient stock — confirmation rejected. ${insufficient.join("; ")}`,
        400,
      );
    }

    for (const item of challan.items) {
      const current = productStockMap.get(item.productId)!.currentStock;
      const next = current - item.quantity;
      if (next < 0) {
        throw new AppError(
          `Insufficient stock — would result in negative stock for product ${item.productId}`,
          400,
        );
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: next },
      });
    }

    await tx.stockMovement.createMany({
      data: challan.items.map((item) => ({
        productId: item.productId,
        quantityChanged: item.quantity,
        movementType: MovementType.OUT,
        reason: `Challan ${challan.challanNumber} — confirmed`,
        createdById: confirmedById,
      })),
    });

    const updated = await tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CONFIRMED },
      include: challanDetailInclude,
    });

    return updated;
  });

  return result as ChallanWithRelations;
}

export async function cancelChallan(id: string): Promise<ChallanWithRelations> {
  const result = await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: challanDetailInclude,
    });
    if (!challan) throw new AppError("Challan not found", 404);

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new AppError("Challan is already cancelled", 400);
    }
    if (challan.status === ChallanStatus.CONFIRMED) {
      throw new AppError(
        "Cannot cancel a confirmed challan — it has already affected stock. Create a reversal stock movement instead.",
        400,
      );
    }
    if (challan.status !== ChallanStatus.DRAFT) {
      throw new AppError(`Cannot cancel challan with status "${challan.status}"`, 400);
    }

    const updated = await tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
      include: challanDetailInclude,
    });

    return updated;
  });

  return result as ChallanWithRelations;
}

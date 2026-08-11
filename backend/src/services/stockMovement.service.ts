import { MovementType, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateStockMovementInput, StockMovementQuery } from "../utils/stockMovement.validation";
import { StockMovementListResponse, StockMovementWithRelations } from "../types/stockMovement.types";

export async function getStockMovements(query: StockMovementQuery): Promise<StockMovementListResponse> {
  const { search, productId, movementType, category, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.StockMovementWhereInput = {};

  if (productId) {
    where.productId = productId;
  }

  if (movementType) {
    where.movementType = movementType;
  }

  if (search || category) {
    where.product = {
      AND: [
        search
          ? {
              OR: [
                { productName: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
              ],
            }
          : undefined,
        category ? { category: { contains: category, mode: "insensitive" } } : undefined,
      ].filter(Boolean) as Prisma.ProductWhereInput[],
    };
  }

  const include = {
    product: {
      select: {
        id: true,
        productName: true,
        sku: true,
        category: true,
        warehouseLocation: true,
      },
    },
    createdBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  };

  const [stockMovements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }) as Promise<StockMovementWithRelations[]>,
    prisma.stockMovement.count({ where }),
  ]);

  return {
    stockMovements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createStockMovement(
  input: CreateStockMovementInput,
  createdById: string,
): Promise<StockMovementWithRelations> {
  const { productId, quantityChanged, movementType, reason } = input;

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    let newStock: number;
    if (movementType === MovementType.IN) {
      newStock = product.currentStock + quantityChanged;
    } else {
      newStock = product.currentStock - quantityChanged;
      if (newStock < 0) {
        throw new AppError(
          `Insufficient stock. Available: ${product.currentStock}, Requested: ${quantityChanged}`,
          400,
        );
      }
    }

    await tx.product.update({
      where: { id: productId },
      data: { currentStock: newStock },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantityChanged,
        movementType,
        reason,
        createdById,
      },
      include: {
        product: {
          select: {
            id: true,
            productName: true,
            sku: true,
            category: true,
            warehouseLocation: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return movement as StockMovementWithRelations;
  });

  return result;
}

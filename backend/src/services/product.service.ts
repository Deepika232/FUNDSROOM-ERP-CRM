import { Product, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateProductInput, UpdateProductInput, ProductQuery } from "../utils/product.validation";
import { ProductListResponse } from "../types/product.types";

const toNull = <T,>(v: T | "" | null): T | null => (v === "" || v === null ? null : (v as T));

export async function getProducts(query: ProductQuery): Promise<ProductListResponse> {
  const { search, category, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { productName: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { contains: category, mode: "insensitive" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string): Promise<Product> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: { stockMovements: true, challanItems: true },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  try {
    return await prisma.product.create({
      data: {
        productName: input.productName,
        sku: input.sku,
        category: input.category,
        unitPrice: input.unitPrice,
        currentStock: input.currentStock ?? 0,
        minimumStockAlertQuantity: input.minimumStockAlertQuantity ?? 0,
        warehouseLocation: toNull(input.warehouseLocation),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta as any)?.target as string[] | undefined;
        if (target?.includes("sku")) {
          throw new AppError("A product with this SKU already exists", 409);
        }
      }
    }
    throw error;
  }
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  try {
    return await prisma.product.update({
      where: { id },
      data: {
        ...(input.productName !== undefined && { productName: input.productName }),
        ...(input.sku !== undefined && { sku: input.sku }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.unitPrice !== undefined && { unitPrice: input.unitPrice }),
        ...(input.currentStock !== undefined && { currentStock: input.currentStock }),
        ...(input.minimumStockAlertQuantity !== undefined && { minimumStockAlertQuantity: input.minimumStockAlertQuantity }),
        ...(input.warehouseLocation !== undefined && { warehouseLocation: toNull(input.warehouseLocation) }),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta as any)?.target as string[] | undefined;
        if (target?.includes("sku")) {
          throw new AppError("A product with this SKU already exists", 409);
        }
      }
    }
    throw error;
  }
}

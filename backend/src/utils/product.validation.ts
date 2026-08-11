import { z } from "zod";

export const createProductSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be at most 200 characters"),
  sku: z
    .string()
    .trim()
    .min(3, "SKU must be at least 3 characters")
    .max(100, "SKU must be at most 100 characters"),
  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category must be at most 100 characters"),
  unitPrice: z.coerce
    .number()
    .positive("Unit price must be positive")
    .max(99999999.99, "Unit price is too high"),
  currentStock: z.coerce
    .number()
    .int("Current stock must be an integer")
    .nonnegative("Current stock cannot be negative")
    .optional(),
  minimumStockAlertQuantity: z.coerce
    .number()
    .int("Minimum stock alert must be an integer")
    .nonnegative("Minimum stock alert cannot be negative")
    .optional(),
  warehouseLocation: z.union([
    z
      .string()
      .trim()
      .min(2, "Warehouse location must be at least 2 characters")
      .max(100, "Warehouse location must be at most 100 characters"),
    z.literal(""),
  ]).optional().or(z.null()),
});

export const updateProductSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be at most 200 characters")
    .optional(),
  sku: z
    .string()
    .trim()
    .min(3, "SKU must be at least 3 characters")
    .max(100, "SKU must be at most 100 characters")
    .optional(),
  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category must be at most 100 characters")
    .optional(),
  unitPrice: z.coerce
    .number()
    .positive("Unit price must be positive")
    .max(99999999.99, "Unit price is too high")
    .optional(),
  currentStock: z.coerce
    .number()
    .int("Current stock must be an integer")
    .nonnegative("Current stock cannot be negative")
    .optional(),
  minimumStockAlertQuantity: z.coerce
    .number()
    .int("Minimum stock alert must be an integer")
    .nonnegative("Minimum stock alert cannot be negative")
    .optional(),
  warehouseLocation: z.union([
    z
      .string()
      .trim()
      .min(2, "Warehouse location must be at least 2 characters")
      .max(100, "Warehouse location must be at most 100 characters"),
    z.literal(""),
  ]).optional().or(z.null()),
});

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;

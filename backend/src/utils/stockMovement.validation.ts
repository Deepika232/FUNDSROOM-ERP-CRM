import { z } from "zod";
import { MovementType } from "@prisma/client";

export const createStockMovementSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "Product ID is required")
    .uuid("Product ID must be a valid UUID"),
  quantityChanged: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be a positive number"),
  movementType: z.nativeEnum(MovementType, {
    message: "Movement type must be IN or OUT",
  }),
  reason: z
    .string()
    .trim()
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason must be at most 500 characters"),
});

export const stockMovementQuerySchema = z.object({
  search: z.string().trim().optional(),
  productId: z.string().trim().uuid().optional(),
  movementType: z.nativeEnum(MovementType).optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
export type StockMovementQuery = z.infer<typeof stockMovementQuerySchema>;

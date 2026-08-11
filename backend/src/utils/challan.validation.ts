import { z } from "zod";
import { ChallanStatus } from "@prisma/client";

export const challanItemSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "Product ID is required")
    .uuid("Product ID must be a valid UUID"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be at least 1"),
});

export const createChallanSchema = z.object({
  customerId: z
    .string()
    .trim()
    .min(1, "Customer ID is required")
    .uuid("Customer ID must be a valid UUID"),
  items: z
    .array(challanItemSchema)
    .min(1, "At least one item is required")
    .max(200, "Maximum 200 items per challan")
    .refine(
      (items) => {
        const seen = new Set<string>();
        for (const it of items) {
          if (seen.has(it.productId)) return false;
          seen.add(it.productId);
        }
        return true;
      },
      { message: "Duplicate products in items — each product may appear only once" },
    ),
});

export const updateChallanSchema = z.object({
  customerId: z
    .string()
    .trim()
    .min(1, "Customer ID is required")
    .uuid("Customer ID must be a valid UUID")
    .optional(),
  items: z
    .array(challanItemSchema)
    .min(1, "At least one item is required")
    .max(200, "Maximum 200 items per challan")
    .refine(
      (items) => {
        const seen = new Set<string>();
        for (const it of items) {
          if (seen.has(it.productId)) return false;
          seen.add(it.productId);
        }
        return true;
      },
      { message: "Duplicate products in items — each product may appear only once" },
    )
    .optional(),
});

export const challanQuerySchema = z.object({
  search: z.string().trim().optional(),
  customerId: z.string().trim().uuid().optional(),
  status: z.nativeEnum(ChallanStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;
export type ChallanQuery = z.infer<typeof challanQuerySchema>;
export type ChallanItemInput = z.infer<typeof challanItemSchema>;

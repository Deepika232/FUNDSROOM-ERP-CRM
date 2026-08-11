import { z } from "zod";

const customerTypeEnum = z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]);
const customerStatusEnum = z.enum(["LEAD", "ACTIVE", "INACTIVE"]);

export const createCustomerSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(200, "Customer name must be at most 200 characters"),
  mobileNumber: z
    .string()
    .trim()
    .min(10, "Mobile number must be at least 10 characters")
    .max(15, "Mobile number must be at most 15 characters"),
  email: z.union([z.string().trim().email("Invalid email address"), z.literal("")]).optional().or(z.null()),
  businessName: z.union([
    z.string().trim().min(2, "Business name must be at least 2 characters").max(200, "Business name must be at most 200 characters"),
    z.literal(""),
  ]).optional().or(z.null()),
  gstNumber: z.union([
    z.string().trim().min(15, "GST number must be at least 15 characters").max(15, "GST number must be at most 15 characters"),
    z.literal(""),
  ]).optional().or(z.null()),
  customerType: customerTypeEnum,
  address: z.union([
    z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address must be at most 500 characters"),
    z.literal(""),
  ]).optional().or(z.null()),
  status: customerStatusEnum.optional(),
  followUpDate: z.union([z.string().datetime(), z.literal("")]).optional().or(z.null()),
  notes: z.union([z.string().trim().max(1000, "Notes must be at most 1000 characters"), z.literal("")]).optional().or(z.null()),
});

export const updateCustomerSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(200, "Customer name must be at most 200 characters")
    .optional(),
  mobileNumber: z
    .string()
    .trim()
    .min(10, "Mobile number must be at least 10 characters")
    .max(15, "Mobile number must be at most 15 characters")
    .optional(),
  email: z.union([z.string().trim().email("Invalid email address"), z.literal("")]).optional().or(z.null()),
  businessName: z.union([
    z.string().trim().min(2, "Business name must be at least 2 characters").max(200, "Business name must be at most 200 characters"),
    z.literal(""),
  ]).optional().or(z.null()),
  gstNumber: z.union([
    z.string().trim().min(15, "GST number must be at least 15 characters").max(15, "GST number must be at most 15 characters"),
    z.literal(""),
  ]).optional().or(z.null()),
  customerType: customerTypeEnum.optional(),
  address: z.union([
    z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address must be at most 500 characters"),
    z.literal(""),
  ]).optional().or(z.null()),
  status: customerStatusEnum.optional(),
  followUpDate: z.union([z.string().datetime(), z.literal("")]).optional().or(z.null()),
  notes: z.union([z.string().trim().max(1000, "Notes must be at most 1000 characters"), z.literal("")]).optional().or(z.null()),
});

export const customerQuerySchema = z.object({
  search: z.string().trim().optional(),
  customerType: customerTypeEnum.optional(),
  status: customerStatusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerQuery = z.infer<typeof customerQuerySchema>;

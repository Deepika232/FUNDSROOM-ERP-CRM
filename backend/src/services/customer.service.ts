import { Customer, CustomerType, CustomerStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateCustomerInput, UpdateCustomerInput, CustomerQuery } from "../utils/customer.validation";
import { CustomerListResponse } from "../types/customer.types";

export async function getCustomers(query: CustomerQuery): Promise<CustomerListResponse> {
  const { search, customerType, status, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {};

  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { mobileNumber: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { businessName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (customerType) {
    where.customerType = customerType as CustomerType;
  }

  if (status) {
    where.status = status as CustomerStatus;
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerById(id: string): Promise<Customer> {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      challans: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { challans: true },
      },
    },
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return customer;
}

const toNull = <T,>(v: T | "" | null): T | null => (v === "" || v === null ? null : (v as T));

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  try {
    return await prisma.customer.create({
      data: {
        customerName: input.customerName,
        mobileNumber: input.mobileNumber,
        email: toNull(input.email),
        businessName: toNull(input.businessName),
        gstNumber: toNull(input.gstNumber),
        customerType: input.customerType as CustomerType,
        address: toNull(input.address),
        status: (input.status as CustomerStatus) ?? "LEAD",
        followUpDate: input.followUpDate && input.followUpDate !== "" ? new Date(input.followUpDate) : null,
        notes: toNull(input.notes),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new AppError("A customer with this mobile number already exists", 409);
      }
    }
    throw error;
  }
}

export async function updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
  const existingCustomer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!existingCustomer) {
    throw new AppError("Customer not found", 404);
  }

  try {
    return await prisma.customer.update({
      where: { id },
      data: {
        ...(input.customerName !== undefined && { customerName: input.customerName }),
        ...(input.mobileNumber !== undefined && { mobileNumber: input.mobileNumber }),
        ...(input.email !== undefined && { email: toNull(input.email) }),
        ...(input.businessName !== undefined && { businessName: toNull(input.businessName) }),
        ...(input.gstNumber !== undefined && { gstNumber: toNull(input.gstNumber) }),
        ...(input.customerType !== undefined && { customerType: input.customerType as CustomerType }),
        ...(input.address !== undefined && { address: toNull(input.address) }),
        ...(input.status !== undefined && { status: input.status as CustomerStatus }),
        ...(input.followUpDate !== undefined && { followUpDate: input.followUpDate && input.followUpDate !== "" ? new Date(input.followUpDate) : null }),
        ...(input.notes !== undefined && { notes: toNull(input.notes) }),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new AppError("A customer with this mobile number already exists", 409);
      }
    }
    throw error;
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  const existingCustomer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: {
        select: { challans: true },
      },
    },
  });

  if (!existingCustomer) {
    throw new AppError("Customer not found", 404);
  }

  if (existingCustomer._count.challans > 0) {
    throw new AppError("Cannot delete customer with existing challans", 400);
  }

  await prisma.customer.delete({
    where: { id },
  });
}

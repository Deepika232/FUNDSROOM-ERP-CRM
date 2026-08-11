import { Request, Response } from "express";
import { ApiSuccessResponse } from "../types/api.types";
import * as customerService from "../services/customer.service";
import { asyncHandler } from "../utils/asyncHandler";
import { CreateCustomerInput, UpdateCustomerInput, CustomerQuery } from "../utils/customer.validation";

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as any).validatedQuery as CustomerQuery;
  const result = await customerService.getCustomers(query);

  const response: ApiSuccessResponse<typeof result> = {
    success: true,
    message: "Customers retrieved successfully",
    data: result,
  };

  res.status(200).json(response);
});

export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const customer = await customerService.getCustomerById(id);

  const response: ApiSuccessResponse<typeof customer> = {
    success: true,
    message: "Customer retrieved successfully",
    data: customer,
  };

  res.status(200).json(response);
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateCustomerInput = req.body;
  const customer = await customerService.createCustomer(input);

  const response: ApiSuccessResponse<typeof customer> = {
    success: true,
    message: "Customer created successfully",
    data: customer,
  };

  res.status(201).json(response);
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const input: UpdateCustomerInput = req.body;
  const customer = await customerService.updateCustomer(id, input);

  const response: ApiSuccessResponse<typeof customer> = {
    success: true,
    message: "Customer updated successfully",
    data: customer,
  };

  res.status(200).json(response);
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await customerService.deleteCustomer(id);

  const response: ApiSuccessResponse = {
    success: true,
    message: "Customer deleted successfully",
  };

  res.status(200).json(response);
});

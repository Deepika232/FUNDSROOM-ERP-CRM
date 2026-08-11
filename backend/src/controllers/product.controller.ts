import { Request, Response } from "express";
import { ApiSuccessResponse } from "../types/api.types";
import * as productService from "../services/product.service";
import { asyncHandler } from "../utils/asyncHandler";
import { CreateProductInput, UpdateProductInput, ProductQuery } from "../utils/product.validation";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as any).validatedQuery as ProductQuery;
  const result = await productService.getProducts(query);

  const response: ApiSuccessResponse<typeof result> = {
    success: true,
    message: "Products retrieved successfully",
    data: result,
  };

  res.status(200).json(response);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const product = await productService.getProductById(id);

  const response: ApiSuccessResponse<typeof product> = {
    success: true,
    message: "Product retrieved successfully",
    data: product,
  };

  res.status(200).json(response);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateProductInput = req.body;
  const product = await productService.createProduct(input);

  const response: ApiSuccessResponse<typeof product> = {
    success: true,
    message: "Product created successfully",
    data: product,
  };

  res.status(201).json(response);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const input: UpdateProductInput = req.body;
  const product = await productService.updateProduct(id, input);

  const response: ApiSuccessResponse<typeof product> = {
    success: true,
    message: "Product updated successfully",
    data: product,
  };

  res.status(200).json(response);
});

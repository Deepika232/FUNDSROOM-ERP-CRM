import { Request, Response } from "express";
import { ApiSuccessResponse } from "../types/api.types";
import * as stockMovementService from "../services/stockMovement.service";
import { asyncHandler } from "../utils/asyncHandler";
import { CreateStockMovementInput, StockMovementQuery } from "../utils/stockMovement.validation";

export const getStockMovements = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as any).validatedQuery as StockMovementQuery;
  const result = await stockMovementService.getStockMovements(query);

  const response: ApiSuccessResponse<typeof result> = {
    success: true,
    message: "Stock movements retrieved successfully",
    data: result,
  };

  res.status(200).json(response);
});

export const createStockMovement = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateStockMovementInput = req.body;
  const createdById = req.user!.id;

  const movement = await stockMovementService.createStockMovement(input, createdById);

  const response: ApiSuccessResponse<typeof movement> = {
    success: true,
    message: "Stock movement recorded successfully",
    data: movement,
  };

  res.status(201).json(response);
});

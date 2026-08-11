import { Request, Response } from "express";
import { ApiSuccessResponse } from "../types/api.types";
import * as challanService from "../services/challan.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ChallanQuery, CreateChallanInput, UpdateChallanInput } from "../utils/challan.validation";

export const getChallans = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as any).validatedQuery as ChallanQuery;
  const result = await challanService.getChallans(query);

  const response: ApiSuccessResponse<typeof result> = {
    success: true,
    message: "Challans retrieved successfully",
    data: result,
  };
  res.status(200).json(response);
});

export const getChallanById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const challan = await challanService.getChallanById(id);
  const response: ApiSuccessResponse<typeof challan> = {
    success: true,
    message: "Challan retrieved successfully",
    data: challan,
  };
  res.status(200).json(response);
});

export const createChallan = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateChallanInput = req.body;
  const createdById = req.user!.id;
  const challan = await challanService.createChallan(input, createdById);
  const response: ApiSuccessResponse<typeof challan> = {
    success: true,
    message: "Challan created successfully",
    data: challan,
  };
  res.status(201).json(response);
});

export const updateChallan = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const input: UpdateChallanInput = req.body;
  const challan = await challanService.updateChallan(id, input);
  const response: ApiSuccessResponse<typeof challan> = {
    success: true,
    message: "Challan updated successfully",
    data: challan,
  };
  res.status(200).json(response);
});

export const confirmChallan = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const confirmedById = req.user!.id;
  const challan = await challanService.confirmChallan(id, confirmedById);
  const response: ApiSuccessResponse<typeof challan> = {
    success: true,
    message: "Challan confirmed successfully",
    data: challan,
  };
  res.status(200).json(response);
});

export const cancelChallan = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const challan = await challanService.cancelChallan(id);
  const response: ApiSuccessResponse<typeof challan> = {
    success: true,
    message: "Challan cancelled successfully",
    data: challan,
  };
  res.status(200).json(response);
});

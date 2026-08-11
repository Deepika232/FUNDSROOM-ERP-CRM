import { Request, Response } from "express";
import { ApiSuccessResponse } from "../types/api.types";

export const getHealth = (_req: Request, res: Response): void => {
  const response: ApiSuccessResponse = {
    success: true,
    message: "API is running",
  };
  res.status(200).json(response);
};

import { Request, Response } from "express";
import {
  getSystemStatus,
  updateSystemStatus,
} from "../services/maintenanceService";

function setErrorResponse(res: Response, error: unknown) {
  return res
    .status(500)
    .json({ message: error instanceof Error ? error.message : `${error}` });
}

// Get system status
export const getSystemStatusController = async (_: Request, res: Response) => {
  try {
    const status = await getSystemStatus();
    return res.status(200).json({ status });
  } catch (error) {
    return setErrorResponse(res, error);
  }
};

// Update system status
export const updateSystemStatusController = async (
  _: Request,
  res: Response,
) => {
  try {
    const result = await updateSystemStatus();
    return res.status(200).json(result);
  } catch (error) {
    return setErrorResponse(res, error);
  }
};

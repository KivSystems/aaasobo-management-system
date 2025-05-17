import { Request, Response } from "express";
import {
  getAllPlans,
  getPlanById,
  getWeeklyClassTimes,
} from "../services/plansService";

// Get all plans' information
export const getAllPlansController = async (_: Request, res: Response) => {
  try {
    // Fetch all plan data.
    const data = await getAllPlans();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

function setErrorResponse(res: Response, error: unknown) {
  return res
    .status(500)
    .json({ message: error instanceof Error ? error.message : `${error}` });
}

// Get plan by ID
export const getPlanController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID provided." });
  }
  try {
    const plan = await getPlanById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }
    return res.status(200).json({
      plan: {
        id: plan.id,
        name: plan.name,
        weeklyClassTimes: plan.weeklyClassTimes,
        description: plan.description,
      },
    });
  } catch (error) {
    return setErrorResponse(res, error);
  }
};

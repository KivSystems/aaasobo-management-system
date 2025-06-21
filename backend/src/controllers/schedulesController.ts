import { Request, Response } from "express";
import { getAllSchedules } from "../services/scheduleService";

// Admin dashboard for displaying all schedules
export const getAllSchedulesController = async (_: Request, res: Response) => {
  try {
    // Fetch all schedule.
    const data = await getAllSchedules();
    console.log("Fetched schedules:", data);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

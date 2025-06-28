import { Request, Response } from "express";
import { getAllSchedules } from "../services/scheduleService";

// Admin dashboard for displaying all schedules
export const getAllSchedulesController = async (_: Request, res: Response) => {
  try {
    // Fetch all schedule.
    const data = await getAllSchedules();

    // Organize the data structure
    const organizedData = data.map((schedule) => {
      return {
        id: schedule.id,
        date: schedule.date.toISOString().split("T")[0],
        event: schedule.event.name,
        color: schedule.event.color,
      };
    });

    res.json({ organizedData });
  } catch (error) {
    res.status(500).json({ error });
  }
};

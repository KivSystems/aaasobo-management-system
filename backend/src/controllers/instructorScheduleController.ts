import { Response } from "express";
import {
  getInstructorSchedules,
  getScheduleWithSlots,
  createInstructorSchedule,
} from "../services/instructorScheduleService";
import { type RequestWithId } from "../middlewares/parseId.middleware";

export const getInstructorSchedulesController = async (
  req: RequestWithId,
  res: Response,
) => {
  try {
    const schedules = await getInstructorSchedules(req.id);

    res.status(200).json({
      message: "Instructor schedule versions retrieved successfully",
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching instructor schedule versions:", error);
    res.status(500).json({
      message: "Failed to fetch instructor schedule versions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getInstructorScheduleController = async (
  req: RequestWithId,
  res: Response,
) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);

    if (isNaN(scheduleId)) {
      return res.status(400).json({
        message: "Invalid schedule ID",
      });
    }

    const schedule = await getScheduleWithSlots(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      message: "Schedule retrieved successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({
      message: "Failed to fetch schedule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createInstructorScheduleController = async (
  req: RequestWithId,
  res: Response,
) => {
  try {
    const { effectiveFrom, slots } = req.body;

    if (!effectiveFrom || !slots || !Array.isArray(slots)) {
      return res.status(400).json({
        message: "effectiveFrom and slots array are required",
      });
    }

    const effectiveFromDate = new Date(effectiveFrom);
    if (isNaN(effectiveFromDate.getTime())) {
      return res.status(400).json({
        message: "Invalid effectiveFrom date format",
      });
    }

    // Validate slots
    for (const slot of slots) {
      if (
        typeof slot.weekday !== "number" ||
        slot.weekday < 0 ||
        slot.weekday > 6
      ) {
        return res.status(400).json({
          message: "Invalid weekday. Must be a number between 0-6",
        });
      }

      const startTime = new Date(slot.startTime);
      if (isNaN(startTime.getTime())) {
        return res.status(400).json({
          message: "Invalid startTime format",
        });
      }
    }

    const schedule = await createInstructorSchedule({
      instructorId: req.id,
      effectiveFrom: effectiveFromDate,
      slots: slots.map((slot: any) => ({
        weekday: slot.weekday,
        startTime: new Date(slot.startTime),
      })),
    });

    res.status(201).json({
      message: "Schedule version created successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Error creating schedule version:", error);
    res.status(500).json({
      message: "Failed to create schedule version",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

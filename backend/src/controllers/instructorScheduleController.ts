import { Response } from "express";
import {
  getInstructorSchedules,
  getScheduleWithSlots,
  createInstructorSchedule,
  getInstructorAvailableSlots,
  getAllAvailableSlots,
} from "../services/instructorScheduleService";
import { type RequestWithId } from "../middlewares/parseId.middleware";
import { Request } from "express";

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
    const { effectiveFrom, slots, timezone } = req.body;

    if (!effectiveFrom || !slots || !Array.isArray(slots) || !timezone) {
      return res.status(400).json({
        message: "effectiveFrom, slots array, and timezone are required",
      });
    }

    // Validate effectiveFrom is a valid date
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
    }

    const schedule = await createInstructorSchedule({
      instructorId: req.id,
      effectiveFrom: effectiveFromDate,
      timezone,
      slots: slots.map((slot: any) => ({
        weekday: slot.weekday,
        startTime: slot.startTime,
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

export const getInstructorAvailableSlotsController = async (
  req: RequestWithId,
  res: Response,
) => {
  try {
    const { start, end, timezone, excludeBookedSlots } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        message:
          "start and end query parameters are required (YYYY-MM-DD format)",
      });
    }

    if (typeof start !== "string" || typeof end !== "string") {
      return res.status(400).json({
        message: "start and end must be date strings in YYYY-MM-DD format",
      });
    }

    // Validate timezone is Asia/Tokyo
    if (timezone && timezone !== "Asia/Tokyo") {
      return res.status(400).json({
        message: "Only Asia/Tokyo timezone is supported",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({
        message:
          "Invalid date format. Use YYYY-MM-DD format (e.g., 2025-06-01)",
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Invalid start or end date",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        message: "start must be before end",
      });
    }

    // Convert excludeBookedSlots parameter to boolean
    const shouldExcludeBooked = excludeBookedSlots === "true";

    const availableSlots = await getInstructorAvailableSlots(
      req.id,
      start,
      end,
      "Asia/Tokyo",
      shouldExcludeBooked,
    );

    res.status(200).json({
      message: "Available slots retrieved successfully",
      data: availableSlots,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({
      message: "Failed to fetch available slots",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllAvailableSlotsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { start, end, timezone } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        message:
          "start and end query parameters are required (YYYY-MM-DD format)",
      });
    }

    if (typeof start !== "string" || typeof end !== "string") {
      return res.status(400).json({
        message: "start and end must be date strings in YYYY-MM-DD format",
      });
    }

    // Validate timezone is Asia/Tokyo
    if (timezone && timezone !== "Asia/Tokyo") {
      return res.status(400).json({
        message: "Only Asia/Tokyo timezone is supported",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({
        message:
          "Invalid date format. Use YYYY-MM-DD format (e.g., 2025-06-01)",
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Invalid start or end date",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        message: "start must be before end",
      });
    }

    const availableSlots = await getAllAvailableSlots(start, end, "Asia/Tokyo");

    res.status(200).json({
      message: "Available slots retrieved successfully",
      data: availableSlots,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({
      message: "Failed to fetch available slots",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

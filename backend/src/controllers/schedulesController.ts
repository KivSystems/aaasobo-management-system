import { Request, Response } from "express";
import {
  getAllSchedules,
  deleteSchedules,
  registerSchedules,
  updateSchedules,
} from "../services/scheduleService";
import { convertToISOString } from "../helper/dateUtils";

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

// Update the selected business schedule
export const updateBusinessScheduleController = async (
  req: Request,
  res: Response,
) => {
  const eventId = parseInt(req.body.eventId);
  const { startDate, endDate } = req.body;

  if (!startDate || isNaN(eventId)) {
    return res.sendStatus(400).json({
      error: "Invalid date or event ID.",
    });
  }

  try {
    // Create date & data list to be sent to the service layer
    const dateList = [];

    if (endDate) {
      const start = new Date(convertToISOString(startDate));
      const end = new Date(convertToISOString(endDate));
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dateList.push(convertToISOString(d.toISOString().split("T")[0]));
      }
    } else {
      dateList.push(convertToISOString(startDate));
    }

    const dataList = dateList.map((date) => ({
      date,
      eventId,
    }));

    // If eventId is 0 (No Event), delete the schedules
    // Otherwise, register new schedules and update existing ones
    if (eventId === 0) {
      const deleteResult = await deleteSchedules(dateList);
      return res.status(200).json({ result: deleteResult });
    }

    const startDateISO = dateList[0];
    const endDateISO = dateList[dateList.length - 1];

    // Register new schedules and update existing ones
    const registerResult = await registerSchedules(dataList);
    const updateResult = await updateSchedules(
      startDateISO,
      endDateISO,
      eventId,
    );

    res.status(200).json({ result: registerResult && updateResult });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

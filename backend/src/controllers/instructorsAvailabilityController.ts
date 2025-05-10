import { RequestWithId } from "../middlewares/parseId.middleware";
import { Response } from "express";
import {
  fetchInstructorAvailabilitiesTodayAndAfter,
  getCalendarAvailabilities,
} from "../services/instructorsAvailabilitiesService";

export const getCalendarAvailabilitiesController = async (
  req: RequestWithId,
  res: Response,
) => {
  const instructorId = req.id;

  try {
    const availabilities = await getCalendarAvailabilities(instructorId);
    res.status(200).json(availabilities);
  } catch (error) {
    // res.status(500).json({ error });
    console.error("Error getting instructor calendar availabilities", {
      error,
      context: {
        ID: instructorId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const getInstructorAvailabilitiesTomorrowAndAfter = async (
  req: RequestWithId,
  res: Response,
) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const data = await fetchInstructorAvailabilitiesTodayAndAfter(
      req.id,
      tomorrow,
    );
    return res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

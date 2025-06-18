import { RequestWithId } from "../middlewares/parseId.middleware";
import { Response } from "express";
import {
  getCalendarAvailabilities,
  getInstructorAvailabilities,
} from "../services/instructorsAvailabilitiesService";
import { getRebookableUntil } from "../services/classesService";

export const getCalendarAvailabilitiesController = async (
  req: RequestWithId,
  res: Response,
) => {
  const instructorId = req.id;

  try {
    const availabilities = await getCalendarAvailabilities(instructorId);
    res.status(200).json(availabilities);
  } catch (error) {
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

export const getInstructorAvailabilitiesController = async (
  req: RequestWithId,
  res: Response,
) => {
  const classId = req.id;

  try {
    const rebookableUntil = await getRebookableUntil(classId);

    if (!rebookableUntil) {
      return res.sendStatus(400);
    }

    const instructorAvailabilities =
      await getInstructorAvailabilities(rebookableUntil);

    res.status(200).json(instructorAvailabilities);
  } catch (error) {
    console.error(
      `Error while getting instructor availabilities (class ID: ${classId}):`,
      error,
    );
    res.sendStatus(500);
  }
};

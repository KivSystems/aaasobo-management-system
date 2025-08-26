import { Request, Response } from "express";
import {
  getInstructorAbsences,
  addInstructorAbsence,
  removeInstructorAbsence,
} from "../services/instructorAbsenceService";
import { type RequestWithId } from "../middlewares/parseId.middleware";

export const getInstructorAbsencesController = async (
  req: RequestWithId,
  res: Response,
) => {
  try {
    const instructorId = req.id;
    const absences = await getInstructorAbsences(instructorId);

    res.status(200).json({
      message: "Instructor absences retrieved successfully",
      data: absences,
    });
  } catch (error) {
    console.error("Error fetching instructor absences:", error);
    res.status(500).json({
      message: "Failed to fetch instructor absences",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const addInstructorAbsenceController = async (
  req: RequestWithId,
  res: Response,
) => {
  try {
    const instructorId = req.id;
    const { absentAt } = req.body;

    if (!absentAt) {
      return res.status(400).json({
        message: "absentAt is required",
      });
    }

    const absentAtDate = new Date(absentAt);
    if (isNaN(absentAtDate.getTime())) {
      return res.status(400).json({
        message: "Invalid absentAt date format",
      });
    }

    const absence = await addInstructorAbsence({
      instructorId,
      absentAt: absentAtDate,
    });

    res.status(201).json({
      message: "Instructor absence added successfully",
      data: absence,
    });
  } catch (error) {
    console.error("Error adding instructor absence:", error);
    res.status(500).json({
      message: "Failed to add instructor absence",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const removeInstructorAbsenceController = async (
  req: RequestWithId,
  res: Response,
) => {
  try {
    const instructorId = req.id;
    const { absentAt } = req.params;

    const absentAtDate = new Date(absentAt);
    if (isNaN(absentAtDate.getTime())) {
      return res.status(400).json({
        message: "Invalid absentAt date format",
      });
    }

    const deletedAbsence = await removeInstructorAbsence(
      instructorId,
      absentAtDate,
    );

    res.status(200).json({
      message: "Instructor absence removed successfully",
      data: deletedAbsence,
    });
  } catch (error) {
    console.error("Error removing instructor absence:", error);
    res.status(500).json({
      message: "Failed to remove instructor absence",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

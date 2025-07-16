import { Request, Response } from "express";
import {
  deleteChild,
  getChildById,
  getChildren,
  registerChild,
  updateChildProfile,
} from "../services/childrenService";
import { deleteAttendancesByChildId } from "../services/classAttendancesService";
import {
  checkIfChildHasBookedClass,
  checkIfChildHasCompletedClass,
} from "../services/classesService";
import { prisma } from "../../prisma/prismaClient";
import { RequestWithId } from "../middlewares/parseId.middleware";

export const getChildrenController = async (req: Request, res: Response) => {
  const customerId = req.query.customerId as string;
  if (!customerId) {
    return res.status(400).json({ error: "customerId is required" });
  }

  try {
    const children = await getChildren(customerId);

    res.json({ children });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

export const registerChildController = async (req: Request, res: Response) => {
  const { name, birthdate, personalInfo, customerId } = req.body;

  try {
    const child = await registerChild(
      name,
      birthdate,
      personalInfo,
      customerId,
    );

    res.status(200).json({
      message: "Child is registered successfully",
      child,
    });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

export const updateChildProfileController = async (
  req: RequestWithId,
  res: Response,
) => {
  const childId = req.id;
  const { name, birthdate, personalInfo, customerId } = req.body;

  if (!name || !birthdate || !personalInfo || !customerId) {
    return res.sendStatus(400);
  }

  const formattedBirthdate = `${birthdate}T00:00:00.000Z`;

  try {
    const childToUpdate = await getChildById(childId);
    if (!childToUpdate) {
      return res.sendStatus(404);
    }

    if (childToUpdate.customerId !== customerId) {
      return res.sendStatus(403);
    }

    const isUnchanged =
      childToUpdate.name === name &&
      childToUpdate.birthdate?.toISOString() === formattedBirthdate &&
      childToUpdate.personalInfo === personalInfo;

    if (isUnchanged) {
      return res.status(200).json({ message: "no_change" });
    }

    await updateChildProfile(childId, {
      name,
      birthdate: formattedBirthdate,
      personalInfo,
      customerId,
    });

    res.status(200).json({ message: "updated" });
  } catch (error) {
    console.error("Error updating child profile", {
      error,
      context: {
        customerId,
        childId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

// DELETE a child profile by the child's id
enum ErrorMessages {
  completedClass = "Cannot delete this child's profile because the child has attended a class before.",
  bookedClass = "Cannot delete this child's profile because the child is currently enrolled in booked classes.",
}

export const deleteChildController = async (req: Request, res: Response) => {
  const childId = parseInt(req.params.id);

  if (isNaN(childId)) {
    return res.status(400).json({ error: "Invalid child ID." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const hasCompletedClass = await checkIfChildHasCompletedClass(
        tx,
        childId,
      );
      if (hasCompletedClass) {
        throw new Error(ErrorMessages.completedClass);
      }
      const hasBookedClass = await checkIfChildHasBookedClass(tx, childId);
      if (hasBookedClass) {
        throw new Error(ErrorMessages.bookedClass);
      }

      await deleteAttendancesByChildId(tx, childId);

      const deletedChild = await deleteChild(tx, childId);

      return deletedChild;
    });

    res.status(200).json({
      message: "The child profile was deleted successfully",
      deletedChild: result,
    });
  } catch (error) {
    console.error("Failed to delete the child profile:", error);

    if (
      error instanceof Error &&
      Object.values(ErrorMessages).includes(error.message as ErrorMessages)
    ) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to delete the child profile." });
  }
};

export const getChildByIdController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const child = await getChildById(id);

    res.json(child);
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Failed to fetch child data." });
  }
};

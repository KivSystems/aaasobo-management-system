import { Request, Response } from "express";
import {
  deleteChild,
  getChildById,
  getChildren,
  registerChild,
  updateChildProfile,
} from "../services/childrenService";
import {
  checkIfChildHasBookedClass,
  checkIfChildHasCompletedClass,
  deleteAttendancesByChildId,
} from "../services/classAttendancesService";
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

  if (!name || !birthdate || !personalInfo || !customerId) {
    return res.sendStatus(400);
  }

  const formattedBirthdate = `${birthdate}T00:00:00.000Z`;

  try {
    await registerChild(name, formattedBirthdate, personalInfo, customerId);

    res.sendStatus(200);
  } catch (error) {
    console.error("Error adding a new child", {
      error,
      context: {
        customerId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const updateChildProfileController = async (
  req: RequestWithId,
  res: Response,
) => {
  const childId = req.id;
  const { name, birthdate, personalInfo, customerId } = req.body;

  if (!name || !birthdate || !personalInfo || customerId == null) {
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

export const deleteChildController = async (
  req: RequestWithId,
  res: Response,
) => {
  const childId = req.id;

  try {
    const hasCompletedClass = await checkIfChildHasCompletedClass(childId);
    if (hasCompletedClass) {
      return res.status(409).json({ message: "has_completed_class" });
    }

    const hasBookedClass = await checkIfChildHasBookedClass(childId);
    if (hasBookedClass) {
      return res.status(409).json({ message: "has_booked_class" });
    }

    await prisma.$transaction(async (tx) => {
      await deleteAttendancesByChildId(tx, childId);
      await deleteChild(tx, childId);
    });

    res.status(200).json({
      message: "deleted",
    });
  } catch (error) {
    console.error("Error deleting child", {
      error,
      context: {
        childId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
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

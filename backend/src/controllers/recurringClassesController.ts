import { Response } from "express";
import {
  createRegularClass,
  getRegularClassById,
  getRegularClassesBySubscriptionId,
  updateRegularClass,
  previewRegularClassChange,
  getValidRecurringClassesByInstructorId,
  getRecurringClassesHistoryCountBySubscriptionId,
} from "../services/recurringClassesService";
import {
  RequestWithParams,
  RequestWithBody,
  RequestWith,
  RequestWithQuery,
} from "../middlewares/validationMiddleware";
import type {
  RecurringClassIdParams,
  GetRecurringClassesBySubscriptionQuery,
  GetRecurringClassesByInstructorQuery,
  GetRecurringClassesHistoryCountQuery,
  CreateRecurringClassRequest,
  UpdateRecurringClassRequest,
} from "../../../shared/schemas/recurringClasses";

function handleRegularClassError(error: unknown, res: Response): Response {
  const err =
    error instanceof Error ? error : new Error("An unknown error occurred");

  if (err.message === "Schedule changed. Review the preview again.")
    return res.status(409).json({ message: err.message });
  const businessLogicErrors = [
    "Instructor is not available at the requested time slot",
    "Instructor schedule not found",
    "Only Asia/Tokyo timezone is supported",
    "Regular class already exists at this time slot",
    "Start date must be at least one week from today",
    "Subscription no longer accepts regular classes",
  ];

  if (businessLogicErrors.includes(err.message)) {
    return res.status(400).json({ message: err.message });
  }

  if (err.message === "Regular class not found") {
    return res.status(404).json({ message: err.message });
  }

  return res.status(500).json({ error: err.message });
}

export const createRegularClassController = async (
  req: RequestWithBody<CreateRecurringClassRequest>,
  res: Response,
) => {
  try {
    const recurringClass = await createRegularClass(req.body);

    res.status(201).json({
      message: "Regular class created successfully",
      recurringClass,
    });
  } catch (error) {
    return handleRegularClassError(error, res);
  }
};

export const getRegularClassesBySubscriptionIdController = async (
  req: RequestWithQuery<GetRecurringClassesBySubscriptionQuery>,
  res: Response,
) => {
  try {
    const recurringClasses = await getRegularClassesBySubscriptionId(
      req.query.subscriptionId,
      req.query.status,
    );

    res.json({ recurringClasses });
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("An unknown error occurred");
    res.status(500).json({ error: err.message });
  }
};

export const getRecurringClassesHistoryCountController = async (
  req: RequestWithQuery<GetRecurringClassesHistoryCountQuery>,
  res: Response,
) => {
  try {
    const count = await getRecurringClassesHistoryCountBySubscriptionId(
      req.query.subscriptionId,
    );
    res.status(200).json({ count });
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("An unknown error occurred");
    res.status(500).json({ error: err.message });
  }
};

export const previewRegularClassController = async (
  req: RequestWith<RecurringClassIdParams, UpdateRecurringClassRequest>,
  res: Response,
) => {
  const user = (req as typeof req & { user?: { id: string; userType: string } })
    .user;
  if (user?.userType === "customer" && Number(user.id) !== req.body.customerId)
    return res.status(403).json({ message: "Forbidden" });
  try {
    return res.json(
      await previewRegularClassChange({
        ...req.body,
        recurringClassId: req.params.id,
      }),
    );
  } catch (error) {
    return handleRegularClassError(error, res);
  }
};

export const updateRegularClassController = async (
  req: RequestWith<RecurringClassIdParams, UpdateRecurringClassRequest>,
  res: Response,
) => {
  const user = (req as typeof req & { user?: { id: string; userType: string } })
    .user;
  if (user?.userType === "customer" && Number(user.id) !== req.body.customerId)
    return res.status(403).json({ message: "Forbidden" });
  try {
    const result = await updateRegularClass({
      recurringClassId: req.params.id,
      ...req.body,
    });

    res.status(200).json({
      message: "Regular class updated successfully",
      oldRecurringClass: result.oldRecurringClass,
      newRecurringClass: result.newRecurringClass,
    });
  } catch (error) {
    return handleRegularClassError(error, res);
  }
};

export const getRegularClassByIdController = async (
  req: RequestWithParams<RecurringClassIdParams>,
  res: Response,
) => {
  try {
    const recurringClass = await getRegularClassById(req.params.id);
    res.status(200).json(recurringClass);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("An unknown error occurred");

    if (err.message === "Recurring class not found") {
      return res.status(404).json({ message: err.message });
    }

    console.error("Error getting recurring class by ID:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getRecurringClassesByInstructorIdController = async (
  req: RequestWithQuery<GetRecurringClassesByInstructorQuery>,
  res: Response,
) => {
  try {
    const recurringClasses = await getValidRecurringClassesByInstructorId(
      req.query.instructorId,
      new Date(),
    );

    res.status(200).json({ recurringClasses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

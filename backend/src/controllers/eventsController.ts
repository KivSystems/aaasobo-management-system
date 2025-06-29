import { Request, Response } from "express";
import { getAllEvents, getEventById } from "../services/eventsService";

// Get all events' information
export const getAllEventsController = async (_: Request, res: Response) => {
  try {
    // Fetch all event data.
    const data = await getAllEvents();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

function setErrorResponse(res: Response, error: unknown) {
  return res
    .status(500)
    .json({ message: error instanceof Error ? error.message : `${error}` });
}

// Get event by ID
export const getEventController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID provided." });
  }
  try {
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.status(200).json({
      event: {
        id: event.id,
        name: event.name,
        color: event.color,
      },
    });
  } catch (error) {
    return setErrorResponse(res, error);
  }
};

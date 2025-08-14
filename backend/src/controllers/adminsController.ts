import { Request, Response } from "express";
import { registerAdmin, getAdminByEmail } from "../services/adminsService";
import {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../services/adminsService";
import {
  getAllInstructors,
  registerInstructor,
  getInstructorByEmail,
  getInstructorByNickname,
  getInstructorByClassURL,
  getInstructorByMeetingId,
  getInstructorByPasscode,
  getInstructorByIntroductionURL,
} from "../services/instructorsService";
import { getClassesWithinPeriod } from "../services/classesService";
import { getAllCustomers } from "../services/customersService";
import { getAllChildren } from "../services/childrenService";
import { getAllPlans, registerPlan } from "../services/plansService";
import {
  getAllEvents,
  registerEvent,
  updateEvent,
  deleteEvent,
} from "../services/eventsService";

// Register Admin
export const registerAdminController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.sendStatus(400);
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingAdmin = await getAdminByEmail(normalizedEmail);
    if (existingAdmin) {
      return res.sendStatus(409);
    }

    await registerAdmin({
      name,
      email: normalizedEmail,
      password,
    });

    res.sendStatus(201);
  } catch (error) {
    console.error("Error registering admin", { error });
    res.sendStatus(500);
  }
};

// Update the applicable admin data
export const updateAdminProfileController = async (
  req: Request,
  res: Response,
) => {
  const adminId = parseInt(req.params.id);
  const { name, email } = req.body;

  try {
    if (!name || !email) {
      return res.sendStatus(400);
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if the updated email already exists
    const existingAdmin = await getAdminByEmail(normalizedEmail);
    if (existingAdmin && existingAdmin.id !== adminId) {
      return res.sendStatus(409);
    }

    const admin = await updateAdmin(adminId, name, email);

    res.status(200).json({
      message: "Admin is updated successfully",
      admin,
    });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

export const deleteAdminController = async (req: Request, res: Response) => {
  const adminId = parseInt(req.params.id);

  if (isNaN(adminId)) {
    return res.status(400).json({ error: "Invalid admin ID." });
  }

  try {
    const deletedAdmin = await deleteAdmin(adminId);

    res.status(200).json({
      message: "The admin profile was deleted successfully",
      id: deletedAdmin.id,
    });
  } catch (error) {
    console.error("Failed to delete the admin profile:", error);
    res.status(500).json({ error: "Failed to delete the admin profile." });
  }
};

interface Subscription {
  id: number;
  planId: number;
  customerId: number;
  startAt: Date;
  endAt: Date | null;
  plan: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    name: string;
    email: string;
    password: string;
    children: {
      id: number;
      customerId: number;
      name: string;
    }[];
  };
}

interface SingleChildSubscription extends Omit<Subscription, "customer"> {
  customer: Omit<Subscription["customer"], "children"> & {
    children: {
      id: number;
      customerId: number;
      name: string;
    };
  };
}

function setErrorResponse(res: Response, error: unknown) {
  return res
    .status(500)
    .json({ message: error instanceof Error ? error.message : `${error}` });
}

export const getAdminController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID provided." });
  }
  try {
    const admin = await getAdminById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    return res.status(200).json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    return setErrorResponse(res, error);
  }
};

// Admin dashboard for displaying admins' information
export const getAllAdminsController = async (_: Request, res: Response) => {
  try {
    // Fetch the admin data using the email.
    const admins = await getAllAdmins();

    // Transform the data structure.
    const data = admins.map((admin, number) => {
      const { id, name, email } = admin;

      return {
        No: number + 1,
        ID: id,
        Admin: name,
        Email: email,
      };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Admin dashboard for displaying customers' information
export const getAllCustomersController = async (_: Request, res: Response) => {
  try {
    // Fetch all customers data using the email.
    const customers = await getAllCustomers();

    // Transform the data structure.
    const data = customers.map((customer, number) => {
      const { id, name, email, prefecture } = customer;

      return {
        No: number + 1,
        ID: id,
        Customer: name,
        Email: email,
        Prefecture: prefecture,
      };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Admin dashboard for displaying instructors' information
export const getAllInstructorsController = async (
  _: Request,
  res: Response,
) => {
  try {
    // Fetch the instructors data using the email.
    const instructors = await getAllInstructors();

    // Transform the data structure.
    const data = instructors.map((instructor, number) => {
      const { id, name, nickname, email } = instructor;

      return {
        No: number + 1,
        ID: id,
        Instructor: name,
        Nickname: nickname,
        Email: email,
      };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Register instructor by admin
export const registerInstructorController = async (
  req: Request,
  res: Response,
) => {
  const icon = req.file;
  const {
    name,
    nickname,
    email,
    password,
    birthdate,
    lifeHistory,
    favoriteFood,
    hobby,
    messageForChildren,
    workingTime,
    skill,
    classURL,
    meetingId,
    passcode,
    introductionURL,
  } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !nickname ||
    !icon ||
    !classURL ||
    !meetingId ||
    !passcode ||
    !introductionURL
  ) {
    return res.sendStatus(400);
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Set unique checks list
  const uniqueChecks = [
    { fn: getInstructorByNickname, value: nickname },
    { fn: getInstructorByEmail, value: normalizedEmail },
    { fn: getInstructorByClassURL, value: classURL },
    { fn: getInstructorByMeetingId, value: meetingId },
    { fn: getInstructorByPasscode, value: passcode },
    { fn: getInstructorByIntroductionURL, value: introductionURL },
  ];
  let errorItems = "";

  try {
    const results = await Promise.all(
      uniqueChecks.map(({ fn, value }) => fn(value)),
    );

    const [
      emailExists,
      nicknameExists,
      classURLExists,
      meetingIdExists,
      passcodeExists,
      introductionURLExists,
    ] = results;

    // Make list of error items and set the text including each error item
    if (nicknameExists) errorItems = errorItems.concat(", ", "Nickname");
    if (emailExists) errorItems = errorItems.concat(", ", "Email");
    if (classURLExists) errorItems = errorItems.concat(", ", "Class URL");
    if (meetingIdExists) errorItems = errorItems.concat(", ", "Meeting ID");
    if (passcodeExists) errorItems = errorItems.concat(", ", "Pass Code");
    if (introductionURLExists)
      errorItems = errorItems.concat(", ", "Introduction URL");

    // Count the number of commas in the errorItems string
    const errorItemCount = (errorItems.match(/,/g) || []).length;

    if (errorItemCount > 0) {
      // Remove the first comma and space from the errorItems string
      errorItems = errorItems.substring(2);
      // Return error items
      return res.status(409).json({ items: errorItems });
    }

    await registerInstructor({
      name,
      nickname,
      email: normalizedEmail,
      password,
      icon,
      birthdate,
      lifeHistory,
      favoriteFood,
      hobby,
      messageForChildren,
      workingTime,
      skill,
      classURL,
      meetingId,
      passcode,
      introductionURL,
    });

    res.sendStatus(201);
  } catch (error) {
    console.error("Error registering instructor", { error });
    res.sendStatus(500);
  }
};

// Admin dashboard for displaying children's information
export const getAllChildrenController = async (_: Request, res: Response) => {
  try {
    // Fetch all children data using the email.
    const children = await getAllChildren();

    // Transform the data structure.
    const data = children.map((child, number) => {
      const { id, name, customer, birthdate, personalInfo } = child;

      return {
        No: number + 1,
        ID: id,
        Child: name,
        "Customer ID": customer.id,
        Customer: customer.name,
        Birthdate: birthdate?.toISOString().slice(0, 10),
        "Personal Info": personalInfo,
      };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Admin dashboard for displaying all plans' information
export const getAllPlansController = async (_: Request, res: Response) => {
  try {
    // Fetch all plans data.
    const plans = await getAllPlans();

    // Transform the data structure.
    const data = plans.map((plan, number) => {
      const { id, name, weeklyClassTimes, description } = plan;

      return {
        No: number + 1,
        ID: id,
        Plan: name,
        "Weekly Class Times": weeklyClassTimes,
        Description: description,
      };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Register a new plan
export const registerPlanController = async (req: Request, res: Response) => {
  const { name, weeklyClassTimes, description } = req.body;

  if (!name || !weeklyClassTimes || !description) {
    return res.sendStatus(400);
  }

  // Normalize the plan name
  const normalizedPlanName = name.toLowerCase().replace(/\s/g, "");

  try {
    // Check if the plan with the same name already exists
    const existingPlans = await getAllPlans();
    const planExists = existingPlans.some(
      (plan) =>
        plan.name.toLowerCase().replace(/\s/g, "") === normalizedPlanName,
    );
    if (planExists) {
      return res.sendStatus(409);
    }

    await registerPlan({
      name,
      weeklyClassTimes,
      description,
    });

    res.sendStatus(201);
  } catch (error) {
    console.error("Error registering a new plan", { error });
    res.sendStatus(500);
  }
};

// Admin dashboard for displaying all events' information
export const getAllEventsController = async (_: Request, res: Response) => {
  try {
    // Fetch all events data.
    const events = await getAllEvents();

    // Transform the data structure.
    const data = events.map((event, number) => {
      const { id, name, color } = event;

      return {
        No: number + 1,
        ID: id,
        Event: name,
        "Color Code": color,
      };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Register a new event
export const registerEventController = async (req: Request, res: Response) => {
  const { name, color } = req.body;

  // Validate the input
  if (!name || !color) {
    return res.sendStatus(400);
  }

  // Check if the event name is in the correct format
  const nameFormatCheck = /^([^\x00-\x7F]+) \/ ([a-zA-Z0-9 ]+)$/.test(name);
  if (nameFormatCheck === false) {
    return res.status(422).json({
      items: ["Event Name must be in the format: 日本語名 / English Name"],
    });
  }

  // Normalize the event name and color code
  const normalizedEventName = name.toLowerCase().replace(/\s/g, "");
  const normalizedColorCode = color.toLowerCase().replace(/\s/g, "");

  try {
    // Check if the event with the same name and color already exists
    const existingEvents = await getAllEvents();
    const eventNameExists = existingEvents.some(
      (event) =>
        event.name.toLowerCase().replace(/\s/g, "") === normalizedEventName,
    );
    const eventColorExists = existingEvents.some(
      (event) =>
        event.color.toLowerCase().replace(/\s/g, "") === normalizedColorCode,
    );

    // Collect conflict reasons
    const conflictItems: string[] = [];
    if (eventNameExists) conflictItems.push("Event name");
    if (eventColorExists) conflictItems.push("Color code");

    if (conflictItems.length > 0) {
      return res.status(409).json({ items: conflictItems });
    }

    // Register the new event
    await registerEvent({
      name,
      color: normalizedColorCode,
    });

    res.sendStatus(201);
  } catch (error) {
    console.error("Error registering a new event", { error });
    res.sendStatus(500);
  }
};

// Update the applicable event data
export const updateEventProfileController = async (
  req: Request,
  res: Response,
) => {
  const eventId = parseInt(req.params.id);
  const { name, color } = req.body;

  // Normalize the event name and color code
  const normalizedEventName = name.toLowerCase().replace(/\s/g, "");
  const normalizedColorCode = color.toLowerCase().replace(/\s/g, "");

  try {
    // Validate the input
    if (!name || !color) {
      return res.sendStatus(400);
    }

    // Check if the event name is in the correct format
    const nameFormatCheck = /^([^\x00-\x7F]+) \/ ([a-zA-Z0-9 ]+)$/.test(name);
    if (nameFormatCheck === false) {
      return res.status(422).json({
        items: ["Event Name must be in the format: 日本語名 / English Name"],
      });
    }

    // Check if the event with the same name and color already exists
    const existingEvents = await getAllEvents();
    const eventNameExists = existingEvents.some(
      (event) =>
        event.name.toLowerCase().replace(/\s/g, "") === normalizedEventName &&
        event.id !== eventId,
    );
    const eventColorExists = existingEvents.some(
      (event) =>
        event.color.toLowerCase().replace(/\s/g, "") === normalizedColorCode &&
        event.id !== eventId,
    );

    // Collect conflict reasons
    const conflictItems: string[] = [];
    if (eventNameExists) conflictItems.push("Event name");
    if (eventColorExists) conflictItems.push("Color code");

    if (conflictItems.length > 0) {
      return res.status(409).json({ items: conflictItems });
    }

    const event = await updateEvent(eventId, name, normalizedColorCode);

    res.status(200).json({
      message: "Event is updated successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

// Delete the selected event
export const deleteEventController = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);

  if (isNaN(eventId)) {
    return res.status(400).json({ error: "Invalid event ID." });
  }

  try {
    const deletedEvent = await deleteEvent(eventId);

    res.status(200).json({
      message: "The event was deleted successfully",
      id: deletedEvent.id,
    });
  } catch (error) {
    console.error("Failed to delete the event:", error);
    res.status(500).json({ error: "Failed to delete the event." });
  }
};

// Get class information within designated period
export const getClassesWithinPeriodController = async (
  _: Request,
  res: Response,
) => {
  try {
    // Fetch class data within designated period (31days).
    const designatedPeriod = 31;
    const designatedPeriodBefore = new Date(
      Date.now() - designatedPeriod * (24 * 60 * 60 * 1000),
    );
    const designatedPeriodAfter = new Date(
      Date.now() + (designatedPeriod + 1) * (24 * 60 * 60 * 1000),
    );
    // Set the designated period to 31 days converted to "T00:00:00.000Z".
    designatedPeriodBefore.setUTCHours(0, 0, 0, 0);
    designatedPeriodAfter.setUTCHours(0, 0, 0, 0);

    const classes = await getClassesWithinPeriod(
      designatedPeriodBefore,
      designatedPeriodAfter,
    );

    // Transform the data structure.
    const data = classes.map((classItem, number) => {
      const { id, instructor, customer, dateTime, status, classCode } =
        classItem;

      // If the free trial class status is "pending" or "declined" before booking, an instructor is not assigned — return "Not Set".
      const instructorName = instructor?.nickname ?? "Not Set";
      const customerName = customer.name;

      // If the free trial class status is "pending" or "declined" before booking, no dateTime is selected — return "Not Set".
      let date = "Not Set";
      let time = "Not Set";

      if (dateTime) {
        // Convert dateTime from UTC to JST (Add 9 hours).
        const dateTimeUTC = new Date(dateTime);
        const dateTimeJST = new Date(
          dateTimeUTC.getTime() + 9 * 60 * 60 * 1000,
        );

        date = dateTimeJST.toISOString().slice(0, 10);
        time = dateTimeJST.toISOString().slice(11, 16);
      }

      // Format the displayed status.
      let statusText = "";
      switch (status) {
        case "booked":
          statusText = "Booked";
          break;
        case "completed":
          statusText = "Completed";
          break;
        case "canceledByCustomer":
          statusText = "Canceled(Customer)";
          break;
        case "canceledByInstructor":
          statusText = "Canceled(Instructor)";
          break;
        case "rebooked":
          statusText = "Rebooked";
          break;
        case "pending":
          statusText = "Pending";
          break;
        case "declined":
          statusText = "Declined";
          break;
      }

      return {
        No: number + 1,
        ID: id,
        Instructor: instructorName,
        Customer: customerName,
        Date: date,
        "JP Time": time,
        Status: statusText,
        "Class Code": classCode,
      };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

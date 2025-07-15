import { Request, Response } from "express";
import { kv } from "@vercel/kv";
import { registerAdmin, getAdminByEmail } from "../services/adminsService";
import { getAllAdmins, getAdminById } from "../services/adminsService";
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
import { getAllPlans } from "../services/plansService";
import bcrypt from "bcrypt";
import { logout } from "../helper/logout";
import { prisma } from "../../prisma/prismaClient";

// Login Admin
export const loginAdminController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Fetch the admin data using the email.
    const admin = await getAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if the password is correct or not.
    const result = await bcrypt.compare(password, admin.password);

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    req.session = {
      userId: admin.id,
      userType: "admin",
    };

    // For production(Save session data to Vercel KV)
    if (process.env.NODE_ENV === "production") {
      const sessionId = req.cookies["session-id"];
      if (sessionId) {
        await kv.set(sessionId, req.session, { ex: 24 * 60 * 60 });
      }
    }

    res.status(200).json({
      message: "Admin logged in successfully",
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Logout Admin
export const logoutAdminController = async (req: Request, res: Response) => {
  return logout(req, res, "admin");
};

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
        Name: name,
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
        Name: name,
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
        Name: name,
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

    await prisma.$transaction(async () => {
      registerInstructor({
        name,
        nickname,
        email: normalizedEmail,
        password,
        icon,
        classURL,
        meetingId,
        passcode,
        introductionURL,
      });
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
        Name: name,
        "Customer ID": customer.id,
        "Customer name": customer.name,
        Birthdate: birthdate?.toISOString().slice(0, 10),
        "Personal info": personalInfo,
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
        "Weekly class times": weeklyClassTimes,
        Description: description,
      };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Get class information within designated period
export const getClassesWithinPeriodController = async (
  _: Request,
  res: Response,
) => {
  try {
    // Fetch class data within designated period.
    const designatedPeriod = 30;
    const designatedPeriodBefore = new Date(
      Date.now() - designatedPeriod * (24 * 60 * 60 * 1000),
    );
    const designatedPeriodAfter = new Date(
      Date.now() + (designatedPeriod + 1) * (24 * 60 * 60 * 1000),
    );
    // Set the designated period to 30 days converted to "T00:00:00.000Z".
    designatedPeriodBefore.setUTCHours(0, 0, 0, 0);
    designatedPeriodAfter.setUTCHours(0, 0, 0, 0);

    const classes = await getClassesWithinPeriod(
      designatedPeriodBefore,
      designatedPeriodAfter,
    );

    // Transform the data structure.
    const data = classes.map((classItem, number) => {
      const { id, instructor, customer, dateTime, status } = classItem;
      const instructorName = instructor.nickname;
      const customerName = customer.name;

      // Convert dateTime from UTC to JST (Add 9 hours).
      const dateTimeUTC = new Date(dateTime);
      const dateTimeJST = new Date(dateTimeUTC.getTime() + 9 * 60 * 60 * 1000);

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
      }

      return {
        No: number + 1,
        ID: id,
        Instructor: instructorName,
        Customer: customerName,
        Date: dateTimeJST.toISOString().slice(0, 10),
        Time: dateTimeJST.toISOString().slice(11, 16),
        Status: statusText,
      };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

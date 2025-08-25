import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prismaClient";
import {
  pickProperties,
  defaultUserImageUrl,
  validateUserImageUrl,
} from "../helper/commonUtils";
import { convertToISOString } from "../helper/dateUtils";
import {
  getInstructorById,
  getAllInstructors,
  getInstructorProfile,
  getInstructorProfiles,
  getInstructorByNickname,
  getInstructorByEmail,
  getInstructorByClassURL,
  getInstructorByMeetingId,
  getInstructorByPasscode,
  getInstructorByIntroductionURL,
  updateInstructor,
} from "../services/instructorsService";
import { type RequestWithId } from "../middlewares/parseId.middleware";
import {
  getCalendarClasses,
  getSameDateClasses,
  getClassByClassId,
} from "../services/classesService";

function setErrorResponse(res: Response, error: unknown) {
  return res
    .status(500)
    .json({ message: error instanceof Error ? error.message : `${error}` });
}

// Fetch instructor id by class id
export const getInstructorIdByClassIdController = async (
  req: Request,
  res: Response,
) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid class ID." });
  }

  try {
    const classInfo = await getClassByClassId(id);

    if (!classInfo) {
      return res.status(404).json({ error: "Applicable class not found." });
    }

    res.status(200).json({
      instructorId: classInfo.instructorId,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Failed to fetch classes." });
  }
};

export const getInstructor = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID provided." });
  }
  try {
    const instructor = await getInstructorById(id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found." });
    }

    // Fetch the blob for the instructor's icon
    const instructorId = instructor.id;
    const instructorIcon = instructor.icon;
    const blob = await validateUserImageUrl(instructorIcon, instructorId);

    return res.status(200).json({
      instructor: {
        id: instructorId,
        name: instructor.name,
        nickname: instructor.nickname,
        email: instructor.email,
        icon: blob,
        birthdate: instructor.birthdate,
        lifeHistory: instructor.lifeHistory,
        favoriteFood: instructor.favoriteFood,
        hobby: instructor.hobby,
        messageForChildren: instructor.messageForChildren,
        workingTime: instructor.workingTime,
        skill: instructor.skill,
        classURL: instructor.classURL,
        meetingId: instructor.meetingId,
        passcode: instructor.passcode,
        introductionURL: instructor.introductionURL,
        terminationAt: instructor.terminationAt,
      },
    });
  } catch (error) {
    return setErrorResponse(res, error);
  }
};

// Update the applicable instructor data
export const updateInstructorProfile = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const {
    name,
    email,
    nickname,
    birthdate,
    workingTime,
    lifeHistory,
    favoriteFood,
    hobby,
    messageForChildren,
    skill,
    classURL,
    meetingId,
    passcode,
    introductionURL,
  } = req.body;

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();
  // Normalize birthdate
  const normalizedBirthdate = new Date(convertToISOString(birthdate));

  // Set unique checks list
  const uniqueChecks = [
    { fn: getInstructorByNickname, value: nickname },
    { fn: getInstructorByEmail, value: normalizedEmail },
    { fn: getInstructorByClassURL, value: classURL },
    { fn: getInstructorByMeetingId, value: meetingId },
    { fn: getInstructorByPasscode, value: passcode },
    { fn: getInstructorByIntroductionURL, value: introductionURL },
  ];
  let errorItems: { [key: string]: string } = {};

  try {
    const results = await Promise.all(
      uniqueChecks.map(({ fn, value }) => fn(value)),
    );

    const [
      nicknameExists,
      emailExists,
      iconExists,
      classURLExists,
      meetingIdExists,
      passcodeExists,
      introductionURLExists,
    ] = results;

    if (nicknameExists && nicknameExists.id !== id) {
      errorItems.nickname = "The nickname is already in use.";
    }
    if (emailExists && emailExists.id !== id) {
      errorItems.email = "The email is already in use.";
    }
    if (iconExists && iconExists.id !== id) {
      errorItems.icon = "The icon is already in use.";
    }
    if (classURLExists && classURLExists.id !== id) {
      errorItems.classURL = "The class URL is already in use.";
    }
    if (meetingIdExists && meetingIdExists.id !== id) {
      errorItems.meetingId = "The meeting ID is already in use.";
    }
    if (passcodeExists && passcodeExists.id !== id) {
      errorItems.passcode = "The passcode is already in use.";
    }
    if (introductionURLExists && introductionURLExists.id !== id) {
      errorItems.introductionURL = "The introduction URL is already in use.";
    }
    if (Object.keys(errorItems).length > 0) {
      return res.status(400).json(errorItems);
    }

    const instructor = await updateInstructor(
      id,
      undefined,
      name,
      nickname,
      normalizedBirthdate,
      workingTime,
      lifeHistory,
      favoriteFood,
      hobby,
      messageForChildren,
      skill,
      normalizedEmail,
      classURL,
      meetingId,
      passcode,
      introductionURL,
    );

    res.status(200).json({
      message: "Instructor is updated successfully",
      instructor,
    });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

// Update the applicable instructor data with icon
export const updateInstructorProfileWithIcon = async (
  req: Request,
  res: Response,
) => {
  const id = parseInt(req.params.id);
  const icon = req.file;
  const {
    name,
    email,
    nickname,
    birthdate,
    workingTime,
    lifeHistory,
    favoriteFood,
    hobby,
    messageForChildren,
    skill,
    classURL,
    meetingId,
    passcode,
    introductionURL,
  } = req.body;

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();
  // Normalize birthdate
  const normalizedBirthdate = new Date(convertToISOString(birthdate));

  // Set unique checks list
  const uniqueChecks = [
    { fn: getInstructorByNickname, value: nickname },
    { fn: getInstructorByEmail, value: normalizedEmail },
    { fn: getInstructorByClassURL, value: classURL },
    { fn: getInstructorByMeetingId, value: meetingId },
    { fn: getInstructorByPasscode, value: passcode },
    { fn: getInstructorByIntroductionURL, value: introductionURL },
  ];
  let errorItems: { [key: string]: string } = {};

  if (!icon) {
    return res.sendStatus(400);
  }

  try {
    const results = await Promise.all(
      uniqueChecks.map(({ fn, value }) => fn(value)),
    );

    const [
      nicknameExists,
      emailExists,
      iconExists,
      classURLExists,
      meetingIdExists,
      passcodeExists,
      introductionURLExists,
    ] = results;

    if (nicknameExists && nicknameExists.id !== id) {
      errorItems.nickname = "The nickname is already in use.";
    }
    if (emailExists && emailExists.id !== id) {
      errorItems.email = "The email is already in use.";
    }
    if (iconExists && iconExists.id !== id) {
      errorItems.icon = "The icon is already in use.";
    }
    if (classURLExists && classURLExists.id !== id) {
      errorItems.classURL = "The class URL is already in use.";
    }
    if (meetingIdExists && meetingIdExists.id !== id) {
      errorItems.meetingId = "The meeting ID is already in use.";
    }
    if (passcodeExists && passcodeExists.id !== id) {
      errorItems.passcode = "The passcode is already in use.";
    }
    if (introductionURLExists && introductionURLExists.id !== id) {
      errorItems.introductionURL = "The introduction URL is already in use.";
    }
    if (Object.keys(errorItems).length > 0) {
      return res.status(400).json(errorItems);
    }

    const instructor = await updateInstructor(
      id,
      icon,
      name,
      nickname,
      normalizedBirthdate,
      workingTime,
      lifeHistory,
      favoriteFood,
      hobby,
      messageForChildren,
      skill,
      normalizedEmail,
      classURL,
      meetingId,
      passcode,
      introductionURL,
    );

    res.status(200).json({
      message: "Instructor is updated successfully",
      instructor,
    });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};
export const getAllInstructorsController = async (
  _: Request,
  res: Response,
) => {
  try {
    const instructors = await getAllInstructors();
    if (!instructors) {
      return res.status(404).json({ message: "Instructors not found." });
    }
    return res.status(200).json({ instructors });
  } catch (error) {
    return setErrorResponse(res, error);
  }
};

// Get all instructor profiles for customer dashboard
export const getAllInstructorProfilesController = async (
  _: Request,
  res: Response,
) => {
  try {
    const instructors = await getAllInstructors();
    if (!instructors) {
      return res.status(404).json({ message: "Instructors not found." });
    }

    // Map the instructors to include only the necessary fields for the profile.
    const instructorProfiles = await Promise.all(
      instructors.map(async (instructor) => {
        // Validate the instructor's icon URL
        const instructorId = instructor.id;
        const instructorIcon = instructor.icon;
        const blob = await validateUserImageUrl(instructorIcon, instructorId);

        return {
          id: instructorId,
          name: instructor.name,
          icon: blob,
          nickname: instructor.nickname,
          birthdate: instructor.birthdate,
          lifeHistory: instructor.lifeHistory,
          favoriteFood: instructor.favoriteFood,
          hobby: instructor.hobby,
          messageForChildren: instructor.messageForChildren,
          workingTime: instructor.workingTime,
          skill: instructor.skill,
          createdAt: instructor.createdAt,
          terminationAt: instructor.terminationAt,
        };
      }),
    );

    return res.status(200).json({ instructorProfiles });
  } catch (error) {
    return setErrorResponse(res, error);
  }
};

export const getInstructorProfileController = async (
  req: RequestWithId,
  res: Response,
) => {
  const instructorId = req.id;

  try {
    const profile = await getInstructorProfile(instructorId);

    if (!profile) {
      return res.sendStatus(404);
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching instructor profile", {
      error,
      context: {
        ID: instructorId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const getCalendarClassesController = async (
  req: RequestWithId,
  res: Response,
) => {
  const instructorId = req.id;

  try {
    const classes = await getCalendarClasses(instructorId);
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error getting instructor calendar classes", {
      error,
      context: {
        ID: instructorId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const getInstructorProfilesController = async (
  _: Request,
  res: Response,
) => {
  try {
    const instructorProfiles = await getInstructorProfiles();
    if (!instructorProfiles) {
      res.sendStatus(404);
    }

    res.status(200).json(instructorProfiles);
  } catch (error) {
    console.error("Error fetching instructor profiles", {
      error,
      context: {
        time: new Date().toISOString(),
      },
    });
    return setErrorResponse(res, error);
  }
};

export const getSameDateClassesController = async (
  req: RequestWithId,
  res: Response,
) => {
  const instructorId = req.id;
  const classId = req.classId;

  if (classId === undefined) {
    return res.sendStatus(400);
  }

  try {
    const classes = await getSameDateClasses(instructorId, classId);
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error getting same-date classes for instructor", {
      error,
      context: {
        ID: instructorId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

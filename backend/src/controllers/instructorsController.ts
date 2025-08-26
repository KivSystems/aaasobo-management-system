import { Request, Response } from "express";
import { validateUserImageUrl } from "../helper/commonUtils";
import {
  getInstructorById,
  getAllInstructors,
  getInstructorProfile,
  getInstructorProfiles,
  getInstructorsToMask,
  maskInstructors,
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

export const maskInstructorsController = async (_: Request, res: Response) => {
  try {
    // Fetch instructors who have left the organization and has not been masked
    const instructorsToMask = await getInstructorsToMask();
    const maskedInstructors = await maskInstructors(instructorsToMask);
    res.status(200).json(maskedInstructors);
  } catch (error) {
    console.error("Error masking instructors", {
      error,
      context: {
        time: new Date().toISOString(),
      },
    });
    return setErrorResponse(res, error);
  }
};

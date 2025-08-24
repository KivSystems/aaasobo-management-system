import { prisma } from "../../prisma/prismaClient";
import { Instructor, Prisma } from "@prisma/client";
import {
  hashPassword,
  defaultUserImageUrl,
  validateUserImageUrl,
} from "../helper/commonUtils";
import { put, del } from "@vercel/blob";

// Register a new instructor account in the DB
export const registerInstructor = async (data: {
  name: string;
  nickname: string;
  email: string;
  password: string;
  icon: Express.Multer.File | undefined;
  birthdate: Date;
  lifeHistory: string;
  favoriteFood: string;
  hobby: string;
  messageForChildren: string;
  workingTime: string;
  skill: string;
  classURL: string;
  meetingId: string;
  passcode: string;
  introductionURL: string;
}) => {
  const hashedPassword = await hashPassword(data.password);
  const icon = data.icon;

  // Check if a new icon is provided.
  let blob;
  if (icon) {
    blob = await put(icon.originalname, icon.buffer, {
      access: "public",
      addRandomSuffix: true,
    });
  } else {
    blob = { url: `${defaultUserImageUrl}?t=${Date.now()}` };
  }

  await prisma.instructor.create({
    data: {
      name: data.name,
      nickname: data.nickname,
      email: data.email,
      password: hashedPassword,
      birthdate: data.birthdate,
      lifeHistory: data.lifeHistory,
      favoriteFood: data.favoriteFood,
      hobby: data.hobby,
      messageForChildren: data.messageForChildren,
      workingTime: data.workingTime,
      skill: data.skill,
      icon: blob.url,
      classURL: data.classURL,
      meetingId: data.meetingId,
      passcode: data.passcode,
      introductionURL: data.introductionURL,
    },
  });

  return;
};

// Fetch all instructors information
export const getAllInstructors = async () => {
  try {
    return await prisma.instructor.findMany({
      orderBy: { id: "asc" },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructors.");
  }
};

export async function getInstructorById(id: number) {
  try {
    return prisma.instructor.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instructor.");
  }
}

export const updateInstructor = async (
  id: number,
  icon: Express.Multer.File | undefined,
  name: string,
  nickname: string,
  birthdate: Date,
  workingTime: string,
  lifeHistory: string,
  favoriteFood: string,
  hobby: string,
  messageForChildren: string,
  skill: string,
  email: string,
  classURL: string,
  meetingId: string,
  passcode: string,
  introductionURL: string,
) => {
  try {
    // Fetch the previous instructor data.
    const prevData = await prisma.instructor.findFirst({
      where: {
        id,
      },
    });

    // If no previous data is found, return early.
    if (!prevData) return;

    // Check if a new icon is provided.
    let blob;
    if (icon) {
      // Update the instructor profile icon.
      await del(prevData.icon);
      blob = await put(icon.originalname, icon.buffer, {
        access: "public",
        addRandomSuffix: true,
      });
    } else {
      // Check if the previous icon URL is valid. If not, use the default icon.
      const prevIconUrl = prevData.icon;
      const prevIconId = prevData.id;
      blob = await validateUserImageUrl(prevIconUrl, prevIconId);
    }

    // Update the instructor data.
    const instructor = await prisma.instructor.update({
      where: {
        id,
      },
      data: {
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
        icon: blob.url,
      },
    });
    return instructor;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update the instructor data.");
  }
};

// Fetch the instructor by the email
export const getInstructorByEmail = async (
  email: string,
): Promise<Instructor | null> => {
  return await prisma.instructor.findUnique({
    where: { email },
  });
};

// Fetch the instructor by the nickname
export const getInstructorByNickname = async (
  nickname: string,
): Promise<Instructor | null> => {
  return await prisma.instructor.findUnique({
    where: { nickname },
  });
};

// Fetch the instructor by the class URL
export const getInstructorByClassURL = async (
  classURL: string,
): Promise<Instructor | null> => {
  return await prisma.instructor.findUnique({
    where: { classURL },
  });
};

// Fetch the instructor by the meeting ID
export const getInstructorByMeetingId = async (
  meetingId: string,
): Promise<Instructor | null> => {
  return await prisma.instructor.findUnique({
    where: { meetingId },
  });
};

// Fetch the instructor by the passcode
export const getInstructorByPasscode = async (
  passcode: string,
): Promise<Instructor | null> => {
  return await prisma.instructor.findUnique({
    where: { passcode },
  });
};

// Fetch the instructor by the introduction URL
export const getInstructorByIntroductionURL = async (
  introductionURL: string,
): Promise<Instructor | null> => {
  return await prisma.instructor.findUnique({
    where: { introductionURL },
  });
};

export async function getInstructorProfile(instructorId: number) {
  const instructorProfile = await prisma.instructor.findUnique({
    where: { id: instructorId },
    select: { id: true, name: true, nickname: true, createdAt: true },
  });

  if (!instructorProfile) {
    return null;
  }

  return instructorProfile;
}

export const updateInstructorPassword = async (
  id: number,
  newPassword: string,
) => {
  return await prisma.instructor.update({
    where: { id },
    data: { password: newPassword },
  });
};

export const getInstructorProfiles = async () => {
  const instructors = await prisma.instructor.findMany({
    where: {
      inactiveAt: null, // Exclude instructors who have quit
    },
  });

  const instructorProfiles = instructors.map((instructor) => ({
    id: instructor.id,
    name: instructor.name,
    nickname: instructor.nickname,
    icon: instructor.icon,
    introductionURL: instructor.introductionURL,
  }));

  return instructorProfiles;
};

export const getInstructorContactById = async (id: number) => {
  return prisma.instructor.findUnique({
    where: { id },
    select: {
      name: true,
      email: true,
    },
  });
};

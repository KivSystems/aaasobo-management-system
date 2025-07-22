// This file contains common functions that are used in multiple controllers or services.

import bcrypt from "bcrypt";

// Create a new object that contains only the properties specified in the array.
export const pickProperties = (
  dBData: any,
  properties: string[],
  mapping?: { [key: string]: string },
) => {
  const pickedProperties: any = {};
  properties.forEach((property) => {
    if (dBData.hasOwnProperty(property)) {
      if (!mapping) {
        pickedProperties[property] = dBData[property];
      } else {
        const newPropertyName = mapping[property] || property;
        pickedProperties[newPropertyName] = dBData[property];
      }
    }
  });
  return pickedProperties;
};

export const FREE_TRIAL_BOOKING_HOURS = 72;
export const REGULAR_REBOOKING_HOURS = 3;

// Standardize salt rounds for hashing passwords
const saltRounds = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, saltRounds);
};

export const hashPasswordSync = (password: string): string => {
  return bcrypt.hashSync(password, saltRounds);
};

// This file contains common functions that are used in multiple controllers or services.

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

// Standardize salt rounds for hashing passwords
export const saltRounds = 12;

export const FREE_TRIAL_BOOKING_HOURS = 72;
export const REGULAR_REBOOKING_HOURS = 3;

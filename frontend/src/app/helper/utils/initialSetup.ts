"use client";

export const initialSetup = (userType: UserType) => {
  switch (userType) {
    case "admin":
      localStorage.setItem("calendarPosition", "default"); // Reset business calendar position
      return;
    case "customer":
      return;
    case "instructor":
      return;
    default:
      console.error("Invalid user type for initial setup.");
      return;
  }
};

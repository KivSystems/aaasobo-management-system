const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const getUserName = async (
  userId: number,
  userType: "admin" | "customer" | "instructor",
) => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/${userType}s/${userId}/${userType}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const user = data[userType];
    if (!user || typeof user.name !== "string") {
      throw new Error("Invalid user data or name property missing");
    }

    return user.name;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    throw error;
  }
};

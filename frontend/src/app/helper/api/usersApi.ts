const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const authenticateUser = async (
  email: string,
  password: string,
  userType: UserType,
) => {
  const apiUrl = `${BACKEND_ORIGIN}/users/authenticate`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({ email, password, userType });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      try {
        const errorDetails = await response.json();
        console.error(
          `Authentication failed: ${response.status} - ${errorDetails.message}`,
        );
        return {
          success: false,
          message:
            errorDetails.message ||
            "Unable to sign in. Please check your details and try again.",
        };
      } catch {
        console.error("Error parsing error response from server.");
        return {
          success: false,
          message: "Something went wrong. Please try again later.",
        };
      }
    }

    const data: { id?: number } = await response.json();

    if (!data.id || typeof data.id !== "number") {
      console.error("Unexpected API response:", data);
      return {
        success: false,
        message:
          "We're experiencing some issues. Please try again in a moment.",
      };
    }

    return { success: true, userId: data.id };
  } catch (error) {
    console.error("Error during authentication:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
};

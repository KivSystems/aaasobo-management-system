const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

export const getVerificationTokenByToken = async (
  token: string,
): Promise<VerificationToken> => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/verification-tokens/${token}`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const verificationToken: VerificationToken = await response.json();
    return verificationToken;
  } catch (error) {
    console.error("Failed to fetch verification token:", error);
    throw error;
  }
};

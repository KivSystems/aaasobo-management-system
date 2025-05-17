const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

const BASE_URL = `${BACKEND_ORIGIN}/plans`;

export type Response<T> = T | { message: string };

// GET all plans data
export const getAllPlans = async () => {
  try {
    const response = await fetch(`${BASE_URL}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    throw error;
  }
};

// Get plan by ID
export const getPlanById = async (
  id: number,
): Promise<Response<{ plan: Plan }>> => {
  const apiUrl = `${BASE_URL}/${id}`;
  const data: Response<{ plan: Plan }> = await fetch(apiUrl, {
    cache: "no-store",
  }).then((res) => res.json());

  return data;
};

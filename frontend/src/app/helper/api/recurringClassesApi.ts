const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";
const BASE_URL = `${BACKEND_ORIGIN}/recurring-classes`;

// GET recurring classes by subscription id
export const getRecurringClassesBySubscriptionId = async (
  subscriptionId: number,
  status?: "active" | "history",
) => {
  try {
    const params = new URLSearchParams({
      subscriptionId: subscriptionId.toString(),
    });
    if (status) {
      params.append("status", status);
    }

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const recurringClasses = await response.json();
    return recurringClasses;
  } catch (error) {
    console.error("Failed to fetch recurring classes:", error);
    throw error;
  }
};

export const editRecurringClass = async (
  recurringClassId: number,
  recurringClassData: {
    instructorId: number;
    customerId: number;
    childrenIds: Array<number>;
    weekday: number;
    startTime: string;
    startDate: string;
    timezone?: string;
  },
) => {
  const URL = `${BASE_URL}/${recurringClassId}`;

  try {
    const response = await fetch(URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recurringClassData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          errorData.error ||
          "Failed to edit recurring class",
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to edit recurring class:", error);
    throw error;
  }
};

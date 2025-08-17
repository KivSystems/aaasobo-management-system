const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";
const BASE_URL = `${BACKEND_ORIGIN}/recurring-classes`;
const WIP_BASE_URL = `${BACKEND_ORIGIN}/wip-recurring-classes`;

export const addRecurringClass = async (recurringClassData: {
  instructorId: number;
  customerId: number;
  childrenIds: Array<number>;
  subscriptionId: number;
  dateTime: string;
}) => {
  try {
    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recurringClassData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error. status ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to add recurring class:", error);
    throw error;
  }
};

// GET recurring classes by subscription id
export const getRecurringClassesBySubscriptionId = async (
  subscriptionId: number,
) => {
  try {
    const response = await fetch(
      `${BASE_URL}?subscriptionId=${subscriptionId}`,
    );
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

// PUT a recurring class
export const editRecurringClass = async (
  recurringClassId: number,
  subscriptionId: number,
  customerId: number,
  state: RecurringClassState,
  classStartDate: string,
) => {
  // Define the data to be sent to the server side.
  const URL = `${BASE_URL}/${recurringClassId}`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    subscriptionId,
    day: state.day,
    time: state.time,
    instructorId: state.instructorId,
    customerId,
    childrenIds: Array.from(state.childrenIds),
    classStartDate,
  });

  try {
    const response = await fetch(URL, {
      method: "PUT",
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to an edit regular class");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to an edit regular class:", error);
    throw error;
  }
};

// GET recurring classes by instructor id
export const getRecurringClassesByInstructorId = async (
  instructorId: number,
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/by-instructorId?instructorId=${instructorId}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.recurringClasses;
  } catch (error) {
    console.error("Failed to fetch recurring classes:", error);
    throw error;
  }
};

// WIP API functions for new instructor schedule system
export const getWipRecurringClassesBySubscriptionId = async (
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

    const response = await fetch(`${WIP_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const recurringClasses = await response.json();
    return recurringClasses;
  } catch (error) {
    console.error("Failed to fetch WIP recurring classes:", error);
    throw error;
  }
};

export const addWipRecurringClass = async (recurringClassData: {
  instructorId: number;
  customerId: number;
  childrenIds: Array<number>;
  subscriptionId: number;
  weekday: number;
  startTime: string;
  startDate: string;
  endDate: string;
}) => {
  try {
    const response = await fetch(`${WIP_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recurringClassData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error. status ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to add WIP recurring class:", error);
    throw error;
  }
};

export const getWipRecurringClassById = async (recurringClassId: number) => {
  try {
    const response = await fetch(`${WIP_BASE_URL}/${recurringClassId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const recurringClass = await response.json();
    return recurringClass;
  } catch (error) {
    console.error("Failed to fetch WIP recurring class by ID:", error);
    throw error;
  }
};

export const editWipRecurringClass = async (
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
  const URL = `${WIP_BASE_URL}/${recurringClassId}`;

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
          "Failed to edit WIP recurring class",
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to edit WIP recurring class:", error);
    throw error;
  }
};

import {
  NO_CHANGES_MADE_MESSAGE,
  PROFILE_ADD_FAILED_MESSAGE,
  PROFILE_ADD_SUCCESS_MESSAGE,
  PROFILE_DELETE_BLOCKED_BY_BOOKED_CLASS_MESSAGE,
  PROFILE_DELETE_BLOCKED_BY_PAST_CLASS_MESSAGE,
  PROFILE_DELETE_FAILED_MESSAGE,
  PROFILE_DELETE_SUCCESS_MESSAGE,
  PROFILE_UPDATE_FAILED_MESSAGE,
  PROFILE_UPDATE_SUCCESS_MESSAGE,
} from "../messages/customerDashboard";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

// GET children data by customer id
export const getChildrenByCustomerId = async (customerId: number) => {
  try {
    const response = await fetch(
      `${BACKEND_ORIGIN}/children?customerId=${customerId}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { children } = await response.json();
    return children;
  } catch (error) {
    console.error("Failed to fetch children data:", error);
    throw error;
  }
};

// GET a child data by the child's id
export const getChildById = async (id: number) => {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/children/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const child = await response.json();
    return child;
  } catch (error) {
    console.error("Failed to fetch child data:", error);
    throw error;
  }
};

export const addChild = async (
  name: string,
  birthdate: string,
  personalInfo: string,
  customerId: number,
): Promise<LocalizedMessages> => {
  const childrenURL = `${BACKEND_ORIGIN}/children`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    name,
    birthdate,
    personalInfo,
    customerId,
  });

  try {
    const response = await fetch(childrenURL, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: PROFILE_ADD_SUCCESS_MESSAGE,
    };
  } catch (error) {
    console.error("API error while adding child:", error);
    return {
      errorMessage: PROFILE_ADD_FAILED_MESSAGE,
    };
  }
};

export const updateChildProfile = async (
  childId: number,
  childName: string,
  childBirthdate: string,
  childInfo: string,
  customerId: number,
): Promise<LocalizedMessages> => {
  const childrenURL = `${BACKEND_ORIGIN}/children/${childId}`;
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    name: childName,
    birthdate: childBirthdate,
    personalInfo: childInfo,
    customerId: Number(customerId),
  });

  try {
    const response = await fetch(childrenURL, {
      method: "PATCH",
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.message === "no_change") {
      return {
        errorMessage: NO_CHANGES_MADE_MESSAGE,
      };
    }

    return {
      successMessage: PROFILE_UPDATE_SUCCESS_MESSAGE,
    };
  } catch (error) {
    console.error("API error while updating child profile:", error);
    return {
      errorMessage: PROFILE_UPDATE_FAILED_MESSAGE,
    };
  }
};

export const deleteChild = async (
  childId: number,
): Promise<LocalizedMessages> => {
  try {
    const childrenURL = `${BACKEND_ORIGIN}/children/${childId}`;
    const headers = { "Content-Type": "application/json" };

    const response = await fetch(childrenURL, {
      method: "DELETE",
      headers,
    });

    if (response.status === 409) {
      const data = await response.json();

      if (data.message === "has_completed_class") {
        return {
          errorMessage: PROFILE_DELETE_BLOCKED_BY_PAST_CLASS_MESSAGE,
        };
      }

      if (data.message === "has_booked_class") {
        return {
          errorMessage: PROFILE_DELETE_BLOCKED_BY_BOOKED_CLASS_MESSAGE,
        };
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: PROFILE_DELETE_SUCCESS_MESSAGE,
    };
  } catch (error) {
    console.error("API error while deleting child profile:", error);
    return {
      errorMessage: PROFILE_DELETE_FAILED_MESSAGE,
    };
  }
};

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
import type {
  ChildProfile,
  ChildrenResponse,
  RegisterChildRequest,
  UpdateChildRequest,
  UpdateChildResponse,
  DeleteChildResponse,
  DeleteChildConflictResponse,
} from "@shared/schemas/children";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";

// GET children data by customer id
export const getChildrenByCustomerId = async (
  customerId: number,
  cookie?: string,
): Promise<Child[]> => {
  try {
    let apiURL;
    let headers;
    let response;
    const method = "GET";

    if (cookie) {
      // From server component
      apiURL = `${BACKEND_ORIGIN}/children?customerId=${customerId}`;
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
      });
    } else {
      // From client component (via proxy)
      apiURL = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/api/proxy`;
      const backendEndpoint = `/children?customerId=${customerId}`;
      headers = {
        "Content-Type": "application/json",
        "backend-endpoint": backendEndpoint,
      };
      response = await fetch(apiURL, {
        method,
        headers,
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ChildrenResponse = await response.json();
    // Transform null values to undefined to match frontend Child type
    return data.children.map((child: ChildProfile) => ({
      ...child,
      birthdate: child.birthdate ?? undefined,
      personalInfo: child.personalInfo ?? undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch children data:", error);
    throw error;
  }
};

export const addChild = async (
  name: string,
  birthdate: string,
  personalInfo: string,
  customerId: number,
  cookie: string,
): Promise<LocalizedMessages> => {
  try {
    // From server component
    const apiURL = `${BACKEND_ORIGIN}/children`;
    const method = "POST";
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const requestData: RegisterChildRequest = {
      name,
      birthdate,
      personalInfo,
      customerId,
    };
    const body = JSON.stringify(requestData);

    const response = await fetch(apiURL, {
      method,
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
  cookie: string,
): Promise<LocalizedMessages> => {
  try {
    // From server component
    const apiURL = `${BACKEND_ORIGIN}/children/${childId}`;
    const method = "PATCH";
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const requestData: UpdateChildRequest = {
      name: childName,
      birthdate: childBirthdate,
      personalInfo: childInfo,
      customerId: Number(customerId),
    };
    const body = JSON.stringify(requestData);

    const response = await fetch(apiURL, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    const data: UpdateChildResponse = await response.json();

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
  cookie: string,
): Promise<LocalizedMessages> => {
  try {
    // From server component
    const apiURL = `${BACKEND_ORIGIN}/children/${childId}`;
    const method = "DELETE";
    const headers = { "Content-Type": "application/json", Cookie: cookie };

    const response = await fetch(apiURL, {
      method,
      headers,
    });

    if (response.status === 409) {
      const data: DeleteChildConflictResponse = await response.json();

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

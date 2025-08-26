import {
  EMAIL_ALREADY_REGISTERED_ERROR,
  GENERAL_ERROR_MESSAGE,
  ADMIN_REGISTRATION_SUCCESS_MESSAGE,
} from "../messages/formValidation";
import { ERROR_PAGE_MESSAGE_EN } from "../messages/generalMessages";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";
const BASE_URL = `${BACKEND_ORIGIN}/admins`;

export type Response<T> = T | { message: string };

export const getAdminById = async (
  id: number,
): Promise<Response<{ admin: Admin }>> => {
  const apiUrl = `${BASE_URL}/admin-list/${id}`;
  const data: Response<{ admin: Admin }> = await fetch(apiUrl, {
    cache: "no-store",
  }).then((res) => res.json());

  return data;
};

// GET all admins data
export const getAllAdmins = async () => {
  try {
    const apiUrl = `${BASE_URL}/admin-list`;
    const response = await fetch(apiUrl, {
      // TODO: Add cache control after completing further implementations
      // next: { tags: ["admin-list"] },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch admins:", error);
    throw error;
  }
};

// GET all instructors data for instructor list
export const getAllInstructors = async () => {
  try {
    const apiUrl = `${BASE_URL}/instructor-list`;
    const response = await fetch(apiUrl, {
      // TODO: Add cache control after completing further implementations
      // next: { tags: ["instructor-list"] },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch instructors:", error);
    throw error;
  }
};

// GET all customers data
export const getAllCustomers = async () => {
  try {
    const apiUrl = `${BASE_URL}/customer-list`;
    const response = await fetch(apiUrl, {
      // TODO: Add cache control after completing further implementations
      // next: { tags: ["customer-list"] },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw error;
  }
};

// GET all children data
export const getAllChildren = async () => {
  try {
    const apiUrl = `${BASE_URL}/child-list`;
    const response = await fetch(apiUrl, {
      // TODO: Add cache control after completing further implementations
      // next: { tags: ["child-list"] },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch children:", error);
    throw error;
  }
};

// GET all plans data
export const getAllPlans = async () => {
  try {
    const apiUrl = `${BASE_URL}/plan-list`;
    const response = await fetch(apiUrl, {
      // TODO: Add cache control after completing further implementations
      // next: { tags: ["plan-list"] },
      cache: "no-store",
    });
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

// GET all events data
export const getAllEvents = async () => {
  try {
    const apiUrl = `${BASE_URL}/event-list`;
    const response = await fetch(apiUrl, {
      // TODO: Add cache control after completing further implementations
      // next: { tags: ["event-list"] },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    throw error;
  }
};

// GET all class data
export const getAllClasses = async () => {
  try {
    const apiUrl = `${BASE_URL}/class-list`;
    const response = await fetch(apiUrl, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    throw error;
  }
};

// GET all schedule data
export const getAllBusinessSchedules = async () => {
  try {
    const apiUrl = `${BASE_URL}/business-schedule`;
    const response = await fetch(apiUrl, {
      // TODO: Add cache control after completing further implementations
      // next: { tags: ["business-schedule"] },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    throw error;
  }
};

export const registerAdmin = async (userData: {
  name: string;
  email: string;
  password: string;
  cookie: string;
}): Promise<RegisterFormState> => {
  try {
    const registerURL = `${BACKEND_ORIGIN}/admins/admin-list/register`;
    const response = await fetch(registerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userData.cookie },
      body: JSON.stringify(userData),
    });

    if (response.status === 409) {
      return { email: EMAIL_ALREADY_REGISTERED_ERROR.en };
    }

    if (!response.ok) {
      throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
    }

    return {
      successMessage: ADMIN_REGISTRATION_SUCCESS_MESSAGE,
    };
  } catch (error) {
    console.error("API error while registering admin:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};

// PATCH admin data
export const updateAdmin = async (
  adminId: number,
  adminName: string,
  adminEmail: string,
  cookie: string,
): Promise<UpdateFormState> => {
  try {
    // Define the data to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/admins/${adminId}`;
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const body = JSON.stringify({
      name: adminName,
      email: adminEmail,
    });

    const response = await fetch(apiURL, {
      method: "PATCH",
      headers,
      body,
    });

    if (response.status === 409) {
      return { email: EMAIL_ALREADY_REGISTERED_ERROR.en };
    }

    const data = await response.json();

    if (response.status !== 200) {
      return { errorMessage: data.message || ERROR_PAGE_MESSAGE_EN };
    }

    return data;
  } catch (error) {
    console.error("API error while updating admin:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};

// DELETE admin data
export const deleteAdmin = async (adminId: number, cookie: string) => {
  try {
    // Define the data to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/admins/admin-list/${adminId}`;
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const response = await fetch(apiURL, {
      method: "DELETE",
      headers,
    });

    if (response.status !== 200) {
      return { errorMessage: ERROR_PAGE_MESSAGE_EN };
    }
    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Failed to delete the admin:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};

export const logoutAdmin = async () => {
  try {
    const response = await fetch(`${BASE_URL}/logout`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to logout:", error);
    throw error;
  }
};

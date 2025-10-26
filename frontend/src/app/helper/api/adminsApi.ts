import {
  EMAIL_ALREADY_REGISTERED_ERROR,
  GENERAL_ERROR_MESSAGE,
  ADMIN_REGISTRATION_SUCCESS_MESSAGE,
} from "../messages/formValidation";
import { ERROR_PAGE_MESSAGE_EN } from "../messages/generalMessages";
import {
  type AdminResponse,
  type AdminsListResponse,
  type InstructorsListResponse,
  type PastInstructorsListResponse,
  type CustomersListResponse,
  type PastCustomersListResponse,
  type ChildrenListResponse,
  type PlansListResponse,
  type SubscriptionsListResponse,
  type EventsListResponse,
  type ClassesListResponse,
  type SchedulesListResponse,
  type UpdateAdminResponse,
  type DeleteResponse,
  type RegisterAdminRequest,
  type UpdateAdminRequest,
} from "@shared/schemas/admins";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";
const BASE_URL = `${BACKEND_ORIGIN}/admins`;

type Response<T> = T | { message: string };

export const getAdminById = async (
  id: number,
  cookie?: string,
): Promise<Response<AdminResponse>> => {
  const apiURL = `${BASE_URL}/admin-list/${id}`;
  const method = "GET";
  let headers;
  let response;

  if (cookie) {
    headers = { "Content-Type": "application/json", Cookie: cookie };
    response = await fetch(apiURL, {
      method,
      headers,
      cache: "no-store",
    });
  } else {
    headers = { "Content-Type": "application/json" };
    response = await fetch(apiURL, {
      method,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  }

  const data: Response<AdminResponse> = await response.json();

  return data;
};

// GET all admins data
export const getAllAdmins = async (
  cookie?: string,
): Promise<AdminsListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/admin-list`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["admin-list"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: AdminsListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch admins:", error);
    throw error;
  }
};

// GET all instructors data for instructor list
export const getAllInstructors = async (
  cookie?: string,
): Promise<InstructorsListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/instructor-list`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["instructor-list"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: InstructorsListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch instructors:", error);
    throw error;
  }
};

// GET all instructors data for instructor list
export const getAllPastInstructors = async (
  cookie?: string,
): Promise<PastInstructorsListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/instructor-list/past`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["instructor-list"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: PastInstructorsListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch past instructors:", error);
    throw error;
  }
};

// GET all customers data
export const getAllCustomers = async (
  cookie?: string,
): Promise<CustomersListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/customer-list`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["customer-list"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: CustomersListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw error;
  }
};

// GET all past customers data
export const getAllPastCustomers = async (
  cookie?: string,
): Promise<PastCustomersListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/customer-list/past`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["customer-list"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: PastCustomersListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch past customers:", error);
    throw error;
  }
};

// GET all children data
export const getAllChildren = async (
  cookie?: string,
): Promise<ChildrenListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/child-list`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["child-list"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: ChildrenListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch children:", error);
    throw error;
  }
};

// GET all plans data
export const getAllPlans = async (
  cookie?: string,
): Promise<PlansListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/plan-list`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["plan-list"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: PlansListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    throw error;
  }
};

// GET all subscriptions data
export const getAllSubscriptions = async (
  cookie?: string,
): Promise<SubscriptionsListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/subscription-list`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["subscription-list"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: SubscriptionsListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    throw error;
  }
};

// GET all events data
export const getAllEvents = async (
  cookie?: string,
): Promise<EventsListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/event-list`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["event-list"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: EventsListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    throw error;
  }
};

// GET all class data
export const getAllClasses = async (
  cookie?: string,
): Promise<ClassesListResponse["data"]> => {
  try {
    const apiURL = `${BASE_URL}/class-list`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        cache: "no-store",
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: ClassesListResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    throw error;
  }
};

// GET all schedule data
export const getAllBusinessSchedules = async (
  cookie?: string,
): Promise<SchedulesListResponse> => {
  try {
    const apiURL = `${BASE_URL}/business-schedule`;
    const method = "GET";
    let headers;
    let response;

    if (cookie) {
      headers = { "Content-Type": "application/json", Cookie: cookie };
      response = await fetch(apiURL, {
        method,
        headers,
        next: { tags: ["business-schedule"] },
      });
    } else {
      headers = { "Content-Type": "application/json" };
      response = await fetch(apiURL, {
        method,
        headers,
        credentials: "include",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: SchedulesListResponse = await response.json();

    return data;
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    throw error;
  }
};

export const registerAdmin = async (
  userData: RegisterAdminRequest & {
    cookie: string;
  },
): Promise<RegisterFormState> => {
  try {
    const apiURL = `${BACKEND_ORIGIN}/admins/admin-list/register`;
    const response = await fetch(apiURL, {
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
  adminData: UpdateAdminRequest,
  cookie: string,
): Promise<UpdateFormState> => {
  try {
    // Define the data to be sent to the server side.
    const apiURL = `${BACKEND_ORIGIN}/admins/${adminId}`;
    const headers = { "Content-Type": "application/json", Cookie: cookie };
    const body = JSON.stringify(adminData);

    const response = await fetch(apiURL, {
      method: "PATCH",
      headers,
      body,
    });

    if (response.status === 409) {
      return { email: EMAIL_ALREADY_REGISTERED_ERROR.en };
    }

    const data: UpdateAdminResponse = await response.json();

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
export const deleteAdmin = async (
  adminId: number,
  cookie: string,
): Promise<DeleteResponse | { errorMessage: string }> => {
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
    const result: DeleteResponse = await response.json();

    return result;
  } catch (error) {
    console.error("Failed to delete the admin:", error);
    return {
      errorMessage: GENERAL_ERROR_MESSAGE,
    };
  }
};

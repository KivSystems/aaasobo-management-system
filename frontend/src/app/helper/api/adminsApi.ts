const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";
const BASE_URL = `${BACKEND_ORIGIN}/admins`;

// GET all admins data
export const getAllAdmins = async () => {
  try {
    const apiUrl = `${BASE_URL}/admin-list`;
    const response = await fetch(apiUrl, {
      next: { tags: ["admin-list"] },
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

// GET all instructors data
export const getAllInstructors = async () => {
  try {
    const apiUrl = `${BASE_URL}/instructor-list`;
    const response = await fetch(apiUrl, {
      next: { tags: ["instructor-list"] },
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
      next: { tags: ["customer-list"] },
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
      next: { tags: ["child-list"] },
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
      next: { tags: ["plan-list"] },
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

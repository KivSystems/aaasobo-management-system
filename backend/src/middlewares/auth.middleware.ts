import { NextFunction, Request, Response, RequestHandler } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userType: string;
  };
}

// Verify user authentication using JWT
export function verifyAuthentication(
  requiredUserType: string[],
): RequestHandler {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    // Load secret and salt from environment variables
    const secret = process.env.AUTH_SECRET;
    const salt = process.env.AUTH_SALT;

    // Check if the required environment variables are set
    if (!secret || !salt) {
      console.error(
        "Missing required environment variables: AUTH_SECRET or AUTH_SALT",
      );
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Extract the JWT token from cookies
    let token: string | undefined;
    if (req.headers.cookie) {
      // From server-side requests
      token = req.headers.cookie
        ?.split("; ")
        .find((cookie) => cookie.startsWith(`${salt}=`))
        ?.split("=")[1];
    } else {
      // From client-side requests
      token = req.cookies?.[salt];
    }

    // If no token is found, return 401 Unauthorized
    if (!token) {
      return res.status(401).json({ message: "No session token found" });
    }

    try {
      // Verify the JWT signature
      const { jwtVerify } = await import("jose");
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
      );

      // Check if the payload contains the required fields
      if (
        !payload.id ||
        !payload.userType ||
        typeof payload.id !== "string" ||
        typeof payload.userType !== "string"
      ) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      // If a specific userType is required, enforce it here
      if (requiredUserType && !requiredUserType.includes(payload.userType)) {
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient permissions" });
      }

      // Attach user info to the request
      req.user = {
        id: payload.id as string,
        userType: payload.userType as string,
      };

      // The following console log is for debugging purposes only and should be removed in production
      console.log("Required user types:", requiredUserType);
      console.log(
        `Authenticated user ID: ${req.user.id}, Type: ${req.user.userType}`,
      );

      next();
    } catch (error) {
      console.error("JWT verification failed:", error);
      return res.status(401).json({ message: "Invalid session token" });
    }
  };
}

// Verify cron job authorization
export async function verifyCronJobAuthorization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

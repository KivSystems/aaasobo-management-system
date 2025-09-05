import { NextFunction, Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userType: string;
  };
}

// Verify user authentication using JWT (signed only, no encryption)
export async function verifyAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const secret = process.env.AUTH_SECRET!;
  const salt = process.env.AUTH_SALT!;
  const token = req.headers.cookie
    ?.split("; ")
    .find((cookie) => cookie.startsWith(`${salt}=`))
    ?.split("=")[1];

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

    // Attach user info to the request
    req.user = {
      id: payload.id as string,
      userType: payload.userType as string,
    };

    // TODO: Add validation check if the operation is allowed for the applicable userType and id
    console.log(
      `Authenticated user ID: ${req.user.id}, Type: ${req.user.userType}`,
    );

    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ message: "Invalid session token" });
  }
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

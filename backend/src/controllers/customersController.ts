import { Request, Response } from "express";
import {
  deleteCustomer,
  getCustomerByEmail,
  getCustomerById,
  registerCustomer,
  updateCustomerProfile,
  verifyCustomerEmail,
} from "../services/customersService";
import {
  getSubscriptionsById,
  createNewSubscription,
} from "../services/subscriptionsService";
import { getWeeklyClassTimes } from "../services/plansService";
import { createNewRecurringClass } from "../services/recurringClassesService";
import { RequestWithId } from "../middlewares/parseId.middleware";
import {
  getCustomerClasses,
  getRebookableClasses,
  getUpcomingClasses,
} from "../services/classesService";
import {
  deleteVerificationToken,
  generateVerificationToken,
  getVerificationTokenByToken,
} from "../services/verificationTokensService";
import { resendVerificationEmail, sendVerificationEmail } from "../helper/mail";
import { prisma } from "../../prisma/prismaClient";
import { deleteChild, registerChild } from "../services/childrenService";

export const registerCustomerController = async (
  req: Request,
  res: Response,
) => {
  const { customerData, childData } = req.body;

  const { email, password, prefecture } = customerData;
  const { birthdate, personalInfo } = childData;

  if (
    !customerData.name ||
    !email ||
    !password ||
    !prefecture ||
    !childData.name ||
    !birthdate ||
    !personalInfo
  ) {
    return res.sendStatus(400);
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingCustomer = await getCustomerByEmail(normalizedEmail);
    if (existingCustomer) {
      return res.sendStatus(409);
    }

    const { customer, child, verificationToken } = await prisma.$transaction(
      async (tx) => {
        const customer = await registerCustomer(
          {
            name: customerData.name,
            email: normalizedEmail,
            password,
            prefecture,
          },
          tx,
        );

        const child = await registerChild(
          childData.name,
          `${birthdate}T00:00:00.000Z`,
          personalInfo,
          customer.id,
          tx,
        );

        const verificationToken = await generateVerificationToken(
          normalizedEmail,
          tx,
        );

        return { customer, child, verificationToken };
      },
    );

    const sendResult = await sendVerificationEmail(
      verificationToken.email,
      customer.name,
      verificationToken.token,
    );

    if (!sendResult.success) {
      await prisma.$transaction(async (tx) => {
        await deleteChild(tx, child.id);
        await deleteCustomer(customer.id, tx);
        await deleteVerificationToken(normalizedEmail, tx);
      });
      return res.sendStatus(503); // Failed to send password reset email. 503 Service Unavailable
    }

    res.sendStatus(201);
  } catch (error) {
    console.error("Error registering customer", {
      error,
      context: {
        email: normalizedEmail,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const getSubscriptionsByIdController = async (
  req: Request,
  res: Response,
) => {
  const customerId = parseInt(req.params.id);

  try {
    const subscriptions = await getSubscriptionsById(customerId);

    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

export const getCustomerByIdController = async (
  req: RequestWithId,
  res: Response,
) => {
  const customerId = req.id;

  try {
    const customer = await getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
};

export const updateCustomerProfileController = async (
  req: Request,
  res: Response,
) => {
  const customerId = parseInt(req.params.id);
  const { name, email, prefecture } = req.body;
  const updatedEmail = email.trim().toLowerCase();

  try {
    const currentCustomerProfile = await getCustomerById(customerId);

    if (!currentCustomerProfile) {
      return res.sendStatus(404);
    }

    const isNameUpdated = name !== currentCustomerProfile.name;
    const isEmailUpdated = updatedEmail !== currentCustomerProfile.email;
    const isPrefectureUpdated =
      prefecture !== currentCustomerProfile.prefecture;

    if (isEmailUpdated) {
      const existingCustomer = await getCustomerByEmail(updatedEmail);
      if (existingCustomer) {
        return res.sendStatus(409); // Conflict: email already registered
      }

      const verificationToken = await generateVerificationToken(updatedEmail);

      const resendResult = await resendVerificationEmail(
        verificationToken.email,
        name,
        verificationToken.token,
      );

      if (!resendResult.success) {
        await deleteVerificationToken(verificationToken.email);
        return res.sendStatus(503); // Service Unavailable:failed to resend verification email
      }
    }

    await updateCustomerProfile(customerId, {
      ...(isNameUpdated && { name }),
      ...(isEmailUpdated && { email: updatedEmail }),
      ...(isPrefectureUpdated && { prefecture }),
      ...(isEmailUpdated && { emailVerified: null }),
    });

    res.status(200).json({
      isEmailUpdated,
    });
  } catch (error) {
    console.error("Error updating customer profile", {
      error,
      context: {
        customerId,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const registerSubscriptionController = async (
  req: Request,
  res: Response,
) => {
  const customerId = parseInt(req.params.id);
  const { planId, startAt } = req.body;

  try {
    // Get weekly class times based on plan id.
    const data = await getWeeklyClassTimes(planId);
    if (!data) {
      res.status(404).json({ error: "Weekly class times not found" });
      return;
    }
    const { weeklyClassTimes } = data;

    // Create new subscription record.
    const subscriptionData = {
      planId,
      customerId,
      startAt: new Date(startAt),
    };
    const newSubscription = await createNewSubscription(subscriptionData);
    if (!newSubscription) {
      res.status(500).json({ error: "Failed to create subscription" });
      return;
    }
    const subscriptionId = newSubscription.id;

    // Create the same number of recurring class records as weekly class times
    for (let i = 0; i < weeklyClassTimes; i++) {
      const newRecurringClass = await createNewRecurringClass(subscriptionId);
      if (!newRecurringClass) {
        res.status(500).json({ error: "Failed to create recurring class" });
        return;
      }
    }

    res.status(200).json({ newSubscription });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getRebookableClassesController = async (
  req: RequestWithId,
  res: Response,
) => {
  const customerId = req.id;

  try {
    const rebookableClasses = await getRebookableClasses(customerId);
    res.status(200).json(rebookableClasses);
  } catch (error) {
    console.error(
      `Error while getting rebookable classes (customer ID: ${customerId}):`,
      error,
    );
    res.sendStatus(500);
  }
};

export const getUpcomingClassesController = async (
  req: RequestWithId,
  res: Response,
) => {
  const customerId = req.id;

  try {
    const upcomingClasses = await getUpcomingClasses(customerId);
    res.status(200).json(upcomingClasses);
  } catch (error) {
    console.error(
      `Error while getting upcoming classes (customer ID: ${customerId}):`,
      error,
    );
    res.sendStatus(500);
  }
};

export const getClassesController = async (
  req: RequestWithId,
  res: Response,
) => {
  const customerId = req.id;

  try {
    const classes = await getCustomerClasses(customerId);
    res.status(200).json(classes);
  } catch (error) {
    console.error(
      `Error while getting customer classes (customer ID: ${customerId}):`,
      error,
    );
    res.sendStatus(500);
  }
};

export const verifyCustomerEmailController = async (
  req: Request,
  res: Response,
) => {
  const { token } = req.body;

  if (!token) {
    return res.sendStatus(400);
  }

  try {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
      return res.sendStatus(404);
    }

    const existingCustomer = await getCustomerByEmail(existingToken.email);

    if (!existingCustomer) {
      return res.sendStatus(404);
    }

    // This is for cases where a customer who has already been verified clicks the email link again.
    if (existingCustomer.emailVerified) {
      return res.sendStatus(200);
    }

    const isTokenExpired = new Date(existingToken.expires) < new Date();

    if (isTokenExpired) {
      return res.sendStatus(410); // 410 Gone
    }

    await verifyCustomerEmail(existingCustomer.id, existingToken.email);

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error verifying customer email", {
      error,
      context: {
        token,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const checkEmailConflictsController = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body;

  if (!email) {
    return res.sendStatus(400);
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingCustomer = await getCustomerByEmail(normalizedEmail);
    if (existingCustomer) {
      return res.sendStatus(409);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error checking email conflicts", {
      error,
      context: {
        email: normalizedEmail,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { instructorsRouter } from "./routes/instructorsRouter";
import { classesRouter } from "./routes/classesRouter";
import { customersRouter } from "./routes/customersRouter";
import { adminsRouter } from "./routes/adminsRouter";
import { childrenRouter } from "./routes/childrenRouter";
import { recurringClassesRouter } from "./routes/recurringClassesRouter";
import { wipRecurringClassesRouter } from "./routes/wipRecurringClassesRouter";
import { plansRouter } from "./routes/plansRouter";
import { eventsRouter } from "./routes/eventsRouter";
import { subscriptionsRouter } from "./routes/subscriptionsRouter";
import { indexRouter } from "./routes/indexRouter";
import { usersRouter } from "./routes/usersRouter";
import { jobsRouter } from "./routes/jobsRouter";

export const server = express();

// Set up allowed origin
const allowedOrigin = process.env.FRONTEND_ORIGIN || "";

// CORS Configuration
server.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Access-Control-Allow-Origin"],
  }),
);

// Middleware
server.use(express.json());
server.use(cookieParser());

// Routes
server.use("/", indexRouter);
server.use("/instructors", instructorsRouter);
server.use("/classes", classesRouter);
server.use("/customers", customersRouter);
server.use("/admins", adminsRouter);
server.use("/children", childrenRouter);
server.use("/recurring-classes", recurringClassesRouter);
server.use("/wip-recurring-classes", wipRecurringClassesRouter);
server.use("/plans", plansRouter);
server.use("/events", eventsRouter);
server.use("/subscriptions", subscriptionsRouter);
server.use("/users", usersRouter);
server.use("/jobs", jobsRouter);

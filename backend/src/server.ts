import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import "dotenv/config";
import { instructorsRouter } from "./routes/instructorsRouter";
import { classesRouter } from "./routes/classesRouter";
import { customersRouter } from "./routes/customersRouter";
import { adminsRouter } from "./routes/adminsRouter";
import { childrenRouter } from "./routes/childrenRouter";
import { recurringClassesRouter } from "./routes/recurringClassesRouter";
import { plansRouter } from "./routes/plansRouter";
import { eventsRouter } from "./routes/eventsRouter";
import { subscriptionsRouter } from "./routes/subscriptionsRouter";
import { indexRouter } from "./routes/indexRouter";
import { usersRouter, usersRouterConfig } from "./routes/usersRouter";
import { instructorsRouterConfig } from "./routes/instructorsRouter";
import { adminsRouterConfig } from "./routes/adminsRouter";
import { childrenRouterConfig } from "./routes/childrenRouter";
import { classesRouterConfig } from "./routes/classesRouter";
import { jobsRouter } from "./routes/jobsRouter";
import { globalRegistry, createOpenApiSpec } from "./openapi/spec";
import { registerRoutesFromConfig } from "./openapi/routerRegistry";

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
server.use("/plans", plansRouter);
server.use("/events", eventsRouter);
server.use("/subscriptions", subscriptionsRouter);
server.use("/users", usersRouter);
server.use("/jobs", jobsRouter);

// OpenAPI Documentation (only in development)
if (process.env.NODE_ENV === "development") {
  registerRoutesFromConfig(globalRegistry, "/users", usersRouterConfig);
  registerRoutesFromConfig(
    globalRegistry,
    "/instructors",
    instructorsRouterConfig,
  );
  registerRoutesFromConfig(globalRegistry, "/admins", adminsRouterConfig);
  registerRoutesFromConfig(globalRegistry, "/children", childrenRouterConfig);
  registerRoutesFromConfig(globalRegistry, "/classes", classesRouterConfig);

  const openApiSpec = createOpenApiSpec();
  server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  server.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(openApiSpec);
  });
}

import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

// Global OpenAPI registry
export const globalRegistry = new OpenAPIRegistry();

// OpenAPI specification generator
export const createOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV3(globalRegistry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "AaasoBo! Management System API",
      description:
        "API documentation for AaasoBo! online English conversation service management system",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
  });
};

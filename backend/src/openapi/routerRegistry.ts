import {
  OpenAPIRegistry,
  ResponseConfig,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { RequestHandler, Request, Response, NextFunction } from "express";

export type RouteHandler = (
  req: any,
  res: Response,
  next?: NextFunction,
) => any;

export type RouteConfig = {
  method: "get" | "post" | "put" | "patch" | "delete";
  requestSchema?: z.ZodSchema;
  paramsSchema?: z.ZodSchema;
  querySchema?: z.ZodSchema;
  handler: RouteHandler;
  middleware?: RequestHandler[];
  openapi: {
    summary: string;
    description: string;
    responses: Record<string, { description: string; schema?: z.ZodSchema }>;
  };
};

/**
 * Register routes from config into OpenAPI registry with base path
 */
export const registerRoutesFromConfig = (
  registry: OpenAPIRegistry,
  basePath: string,
  routeConfigs: Record<string, RouteConfig>,
) => {
  Object.entries(routeConfigs).forEach(([path, config]) => {
    const fullPath = basePath + path;

    // Build responses
    const responses: Record<string, ResponseConfig> = {};
    Object.entries(config.openapi.responses).forEach(
      ([status, responseConfig]) => {
        responses[status] = {
          description: responseConfig.description,
        };

        if (responseConfig.schema) {
          responses[status].content = {
            "application/json": {
              schema: responseConfig.schema,
            },
          };
        }
      },
    );

    // Register path
    registry.registerPath({
      method: config.method,
      path: fullPath,
      summary: config.openapi.summary,
      description: config.openapi.description,
      request: config.requestSchema
        ? {
            body: {
              content: {
                "application/json": {
                  schema: config.requestSchema,
                },
              },
            },
          }
        : undefined,
      responses,
    });
  });
};

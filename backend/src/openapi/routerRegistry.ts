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

// Minimal schema contract we rely on at runtime
export type RouteConfig = {
  method: "get" | "post" | "put" | "patch" | "delete";
  // Strong Zod typing; relies on zod-to-openapi supporting Zod v4
  bodySchema?: z.ZodTypeAny;
  paramsSchema?: z.ZodTypeAny;
  querySchema?: z.ZodTypeAny;
  handler: RouteHandler;
  middleware?: RequestHandler[];
  openapi: {
    summary: string;
    description: string;
    responses: Record<string, { description: string; schema?: z.ZodTypeAny }>;
  };
};

/**
 * Register routes from config into OpenAPI registry with base path
 */
export const registerRoutesFromConfig = (
  registry: OpenAPIRegistry,
  basePath: string,
  routeConfigs: Record<string, readonly RouteConfig[]>,
) => {
  Object.entries(routeConfigs).forEach(([path, configs]) => {
    configs.forEach((config) => {
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
                // Cast to any to bridge Zod v4 types to zod-to-openapi's expected Zod types
                schema: responseConfig.schema as any,
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
        request: config.bodySchema
          ? {
              body: {
                content: {
                  "application/json": {
                    // Cast to any to bridge Zod v4 types to zod-to-openapi's expected Zod types
                    schema: config.bodySchema as any,
                  },
                },
              },
            }
          : undefined,
        responses,
      });
    });
  });
};

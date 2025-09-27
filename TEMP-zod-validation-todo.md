# Zod Validation Implementation Progress

## Completed

- **usersRouter.ts** ✅ (full schema validation + OpenAPI docs)
- **instructorsRouter.ts** ✅ (all routes including schedules and absences + OpenAPI docs)
- **adminsRouter.ts** ✅ (all routes with proper RequestWith types + OpenAPI docs + discriminated union for UpdatePlanRequest)
- **childrenRouter.ts** ✅ (all routes with Zod validation + frontend API types + integration tests)

## Remaining routers

- classesRouter.ts
- customersRouter.ts
- eventsRouter.ts
- indexRouter.ts
- jobsRouter.ts
- plansRouter.ts
- recurringClassesRouter.ts
- subscriptionsRouter.ts

## Implementation Guidelines

### Step-by-Step Process (Per Router)

1. **Implement Zod schemas** in `/shared/schemas/[router].ts`
   - Parameter schemas (IDs, etc.)
   - Request body schemas
   - Response schemas
   - Export inferred types: `export type SchemaName = z.infer<typeof SchemaName>;`
2. **Update router file** to use validation middleware
   - Import schemas and `registerRoutes` from validation middleware
   - Create route config objects with schemas and handlers
   - Replace manual routes with `registerRoutes(router, configs)`
   - Export the route configs for OpenAPI registration: `export { validatedRouteConfigs as [routerName]RouterConfig };`
3. **Update controller file** to use proper RequestWith types
   - Import `RequestWithParams`, `RequestWithBody`, `RequestWith` from validation middleware
   - Import schema types: `import type { SchemaName } from "@shared/schemas/[router]";`
   - Replace `req: Request` with typed requests like `req: RequestWithParams<SchemaIdParams>`
   - Remove manual validation code (`if (!field)`, `isNaN()` checks, etc.)
   - Handle optional fields properly (check if frontend actually sends them, remove `.optional()` if not needed)
4. **Write simple integration tests** (request → response validation)
   - Test key endpoints with valid requests
   - Test error handling with invalid requests
5. **Use shared types on frontend** API functions
   - Import and use schemas for type safety  
   - Update function signatures to use proper types
   - Add type safety to request/response handling
   - Ensure full-stack type consistency
6. **Register router in OpenAPI registry** (server.ts)
   - Import the router config in server.ts
   - Add `registerRoutesFromConfig(globalRegistry, "/[routerPath]", [routerName]RouterConfig);` in development block

### Development Workflow

1. **Create GitHub issue** for the specific router implementation
2. **Create feature branch** from main
3. **Implement** following the step-by-step process above
4. **Quality checks**:
   - `npm run format` (code style)
   - `npm run build` (TypeScript compilation)
   - `npm run test` (all tests pass)
   - `npm run dev` (smoke test endpoints)
5. **Commit** with descriptive message
6. **Self-review** code quality and test coverage
7. **Ready for code review** before creating PR

### Benefits of This Approach

- **Type Safety**: Full request/response validation with TypeScript inference
- **API Documentation**: Automatic OpenAPI spec generation
- **Error Handling**: Consistent validation error responses
- **Maintainability**: Centralized schema definitions
- **Quality Assurance**: Step-by-step validation ensures working code

## Controller Update Guidelines

### Key Patterns for Controller Updates

1. **Import Pattern**:

```typescript
import type {
  SchemaIdParams,
  SchemaRequest,
  SchemaResponse,
} from "@shared/schemas/[router]";
```

2. **Controller Signature Pattern**:

```typescript
// Parameters only
export const getController = async (
  req: RequestWithParams<SchemaIdParams>,
  res: Response,
) => {

// Body only
export const createController = async (
  req: RequestWithBody<CreateSchemaRequest>,
  res: Response,
) => {

// Parameters + Body
export const updateController = async (
  req: RequestWith<SchemaIdParams, UpdateSchemaRequest>,
  res: Response,
) => {
```

3. **Remove Manual Validation**:

```typescript
// ❌ Remove these patterns:
if (!name || !email) return res.sendStatus(400);
if (isNaN(id)) return res.status(400).json({...});
const field = field || ""; // for optional fields that are actually always sent

// ✅ Trust the Zod validation - fields are guaranteed to be present and valid
```

4. **Handle Optional Fields Correctly**:

```typescript
// Check if frontend actually sends optional fields
// If always sent as empty string "", remove .optional() from schema
// If sometimes null/undefined, keep .optional() and handle appropriately
```

### Common Issues and Solutions

- **Type errors with optional fields**: Check if frontend actually omits them or sends empty strings
- **Manual validation still present**: Remove `if (!field)` checks that are now redundant
- **Using `._type`**: Use proper inferred types instead: `z.infer<typeof Schema>`
- **Mixed validation**: Don't mix Zod validation with manual validation in the same endpoint

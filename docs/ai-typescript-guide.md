# AI TypeScript Guide for Envyx

This guide is designed to help AI agents, coding assistants, and contributors maintain a highly consistent and safe TypeScript environment in this project.

## 1. Centralized Types

We use a central repository for core domain models and types. All database-driven types must be inferred utilizing Drizzle ORM's inference utilities and exported from `src/types/index.ts`. 

Do not manually type out representations of the `user`, `project`, or `environment` models.

### Example Inference using Drizzle ORM:
```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, projects } from '@/lib/db/schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
```

### When to use them:
- Use `User` or `Project` when returning fetches from the database.
- Use `NewUser` or `NewProject` when typing objects that are going to be inserted into the database.

## 2. No Implicit `any`
This project runs with strict TypeScript compilation. 

- **Array Methods:** Always provide explicit parameter types for callback functions fed to `.map`, `.filter`, `.reduce`, etc., if TS cannot cleanly infer it from the caller context.
    ```typescript
    // BAD
    const cleaned = lines.map(line => line.trim());
    
    // GOOD
    const cleaned = lines.map((line: string) => line.trim());
    ```
- **Error Handling in Try/Catch:** In `catch(error: any)` blocks, try to properly log or type guard your error message handling. (We permit `: any` explicitly typed for the catch param due to widespread JS behaviors, but inside you must provide defaults like `error?.message || "Server Error"`).

## 3. Drizzle ORM Syntax Rules
Drizzle ORM requires specific functions for filtering constraints. Wait, the IDE can sometimes fail `SQL<unknown>` types if you pass object literals (like `{ id: ... }`) into `.where()`. 

- Always import and use `eq`, `and`, `or`, `inArray` from `drizzle-orm` instead of passing JS object literals to `.where()`.
    ```typescript
    // BAD
    await db.update(projects).set({...}).where({ id: projectId });
    
    // GOOD
    import { eq } from 'drizzle-orm';
    await db.update(projects).set({...}).where(eq(projects.id, projectId));
    ```
- Likewise, define `index` and `unique` within schemas by importing them from `drizzle-orm/pg-core` and using `.on(table.column)`, rather than off `table.index()` directly.

## 4. Path Aliasing
Always use the `@/` absolute path alias when importing internal dependencies such as schemas, lib functions, and types. Relative imports should be avoided except when importing locally adjacent siblings (e.g., schemas cross-referencing each other).

## Summary
By following these core rules, we ensure a unified, strictly-typed codebase that prevents "implicit any" bugs, type discrepancies between frontend and backend, and Drizzle query compilation errors.

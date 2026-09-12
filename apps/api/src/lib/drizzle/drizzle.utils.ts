import type { DbResult } from "./drizzle.types";

// Overload 1: Error OR Mapper provided -> Returns T (Guaranteed via Throw)
export function unwrap<T>(
  result: DbResult<T>,
  errorOrMapper: Error | ((res: Extract<DbResult<T>, { ok: false }>) => Error),
): T;

// Overload 2: No error provided -> Returns T | null
export function unwrap<T>(result: DbResult<T>): T | null;

// Implementation
export function unwrap<T>(
  result: DbResult<T>,
  errorOrMapper?: Error | ((res: Extract<DbResult<T>, { ok: false }>) => Error),
): T | null {
  if (!result.ok) {
    if (errorOrMapper) {
      throw typeof errorOrMapper === "function"
        ? errorOrMapper(result)
        : errorOrMapper;
    }
    return null;
  }

  return result.data;
}

import { logger } from "@/lib/logger";

import type { DbError, DbResult } from "../drizzle.types";

export const toResult = <T>(
  data: T | undefined | null,
): DbResult<NonNullable<T>> => {
  if (data == null) {
    return {
      ok: false,
      data: null,
      reason: "Resource not found",
      type: "NOT_FOUND",
    };
  }
  return { ok: true, data: data as NonNullable<T> };
};

export async function executeSingle<T>(
  promise: Promise<T>,
): Promise<DbResult<NonNullable<T>>> {
  try {
    const data = await promise;
    return toResult(data);
  } catch (error) {
    logger.error({ error }, "Db operation failed");
    return {
      ok: false,
      data: null,
      reason:
        error instanceof Error ? error.message : "Database operation failed",
      type: "DATABASE_ERROR",
    };
  }
}

export function matchSingle<T, R>(
  result: DbResult<T>,
  arms: { ok: (data: T) => R; err: (error: DbError) => R },
): R {
  return result.ok
    ? arms.ok(result.data)
    : arms.err({ type: result.type, reason: result.reason });
}

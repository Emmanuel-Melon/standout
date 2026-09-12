import { DbResult } from "../drizzle/drizzle.types";
import { JobError } from "./pgboss.error";
import { ActionResult, JobUnwrapOptions } from "./pgboss.types";

export async function unwrapDbJob<T>(
  result: DbResult<T> | ActionResult<T>,
  options: string | JobUnwrapOptions<T>,
): Promise<T> {
  const config: JobUnwrapOptions<T> =
    typeof options === "string" ? { message: options } : options;

  const shouldRetry = config.shouldRetry ?? true;

  if (!result.ok) {
    if (config.onFailure) {
      await config.onFailure(result);
    }

    const isDbResult = "type" in result;
    const errorType = isDbResult ? result.type : "ACTION_ERROR";

    const failureReason = isDbResult
      ? result.reason
      : result.error instanceof Error
        ? result.error.message
        : "Unknown Action Failure";

    if (config.fallback !== undefined) {
      return config.fallback;
    }

    throw new JobError(`${config.message}: [${errorType}] ${failureReason}`, {
      shouldRetry: errorType === "DATABASE_ERROR" ? true : shouldRetry,
      meta: {
        resultType: errorType,
        reason: failureReason,
      },
    });
  }

  if (result.data === null || result.data === undefined) {
    throw new JobError(
      `${config.message}: Success reported but data is missing`,
      {
        shouldRetry: false,
      },
    );
  }

  return result.data as T;
}

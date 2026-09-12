import { NextFunction, Request, Response } from "express";

import { sendErrorResponse } from "@/lib/express/express.response";
import { JsonApiErrorObject } from "@/lib/express/express.types";
import { HttpError } from "@/lib/http/http.error";
import { HttpStatus } from "@/lib/http/http.status";
import { logger } from "@/lib/logger";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isDev = process.env.NODE_ENV === "development";

  let status = HttpStatus.INTERNAL_SERVER_ERROR;
  let description = "An unexpected error occurred on our end.";
  let code = "INTERNAL_ERROR";

  if (err instanceof Error) {
    description = err.message;
  }

  if (err instanceof HttpError) {
    status = err.status;
    code = err.code;
  }

  // postgres unique violation
  if ((err as any)?.code === "23505") {
    status = HttpStatus.CONFLICT;
    description = "A resource with these details already exists.";
    code = "CONFLICT";
  }

  sendErrorResponse(req, res, {
    status,
    description,
  });

  res.on("finish", () => {
    logger.error({ err }, "Http Request Failed.");
  });
};

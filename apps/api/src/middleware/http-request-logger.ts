import { NextFunction, Request, Response } from "express";

import { logger } from "@/lib/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.on("finish", () => {
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        message: "Request received",
      },
      "Processed Http Request",
    );
  });
  next();
};

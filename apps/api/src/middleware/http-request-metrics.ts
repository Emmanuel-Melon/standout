import { NextFunction, Request, Response } from "express";

export const requestMetrics = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = res.locals.startTime || Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    res.locals.metrics = {
      duration,
      statusCode: res.statusCode,
      contentLength: res.get("content-length"),
    };
  });
  next();
};

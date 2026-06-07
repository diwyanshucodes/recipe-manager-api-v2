import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, path: req.path }, err.message);
    res.status(err.statusCode).json({ error: err.message });
  } else {
        Sentry.captureException(err);
    logger.error({ path: req.path, err }, "Unhandled error");
    res.status(500).json({ error: "Something went wrong" });
  }
}

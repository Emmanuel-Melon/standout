import { HttpStatus } from "@/lib/http/http.status";

export class HttpError extends Error {
  status: (typeof HttpStatus)[keyof typeof HttpStatus];
  code: string;

  constructor(
    status: (typeof HttpStatus)[keyof typeof HttpStatus],
    message: string,
    code?: string,
  ) {
    super(message);
    this.status = status;
    this.code = code ?? status.statusCode.toString();

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

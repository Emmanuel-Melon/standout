export class JobError extends Error {
  public readonly shouldRetry: boolean;
  public readonly meta?: Record<string, any>;

  constructor(
    message: string,
    options: {
      shouldRetry: boolean;
      meta?: Record<string, any>;
    } = { shouldRetry: true },
  ) {
    super(message);
    this.name = "JobError";
    this.shouldRetry = options.shouldRetry;
    this.meta = options.meta;
  }
}

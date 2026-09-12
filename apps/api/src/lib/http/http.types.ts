export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface FetchClientConfig {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number; // ms, optional
  onError?: (error: unknown) => void;
}

export interface FetchRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export type StatusConfig = {
  statusCode: number;
  title: string;
  code: string;
  description: string;
};

export type StatusCatalog = {
  // 2xx Success
  SUCCESS: StatusConfig;
  CREATED: StatusConfig;
  ACCEPTED: StatusConfig;
  NO_CONTENT: StatusConfig;

  // 3xx Redirection
  MOVED_PERMANENTLY: StatusConfig;
  FOUND: StatusConfig;
  NOT_MODIFIED: StatusConfig;
  TEMPORARY_REDIRECT: StatusConfig;
  PERMANENT_REDIRECT: StatusConfig;

  // 4xx Client Errors
  BAD_REQUEST: StatusConfig;
  UNAUTHORIZED: StatusConfig;
  PAYMENT_REQUIRED: StatusConfig;
  FORBIDDEN: StatusConfig;
  NOT_FOUND: StatusConfig;
  METHOD_NOT_ALLOWED: StatusConfig;
  NOT_ACCEPTABLE: StatusConfig;
  REQUEST_TIMEOUT: StatusConfig;
  CONFLICT: StatusConfig;
  GONE: StatusConfig;
  TOO_MANY_REQUESTS: StatusConfig;

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: StatusConfig;
  NOT_IMPLEMENTED: StatusConfig;
  BAD_GATEWAY: StatusConfig;
  SERVICE_UNAVAILABLE: StatusConfig;
  GATEWAY_TIMEOUT: StatusConfig;
};

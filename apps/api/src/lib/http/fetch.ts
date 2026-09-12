import {
  FetchClientConfig,
  FetchRequestOptions,
  HttpMethod,
} from "./http.types";

export class FetchClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout?: number;
  private onError?: (error: unknown) => void;

  constructor(config: FetchClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, "");
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.timeout = config.timeout;
    this.onError = config.onError;
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    options?: FetchRequestOptions,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = {
      ...this.defaultHeaders,
      ...options?.headers,
    };

    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | undefined;
    if (this.timeout) {
      timeoutId = setTimeout(() => controller.abort(), this.timeout);
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal ?? controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        throw new Error(
          `HTTP ${response.status}: ${errorData.message || errorData.error || "Unknown error"}`,
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (this.onError) this.onError(error);
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  get<T>(endpoint: string, options?: FetchRequestOptions): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: FetchRequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", endpoint, body, options);
  }

  put<T>(
    endpoint: string,
    body?: unknown,
    options?: FetchRequestOptions,
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, body, options);
  }

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: FetchRequestOptions,
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, body, options);
  }

  delete<T>(endpoint: string, options?: FetchRequestOptions): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}

export function createFetchClient(config: FetchClientConfig): FetchClient {
  return new FetchClient(config);
}

import { AsyncLocalStorage } from "async_hooks";

export interface AsyncStore {
  requestId: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<AsyncStore>();

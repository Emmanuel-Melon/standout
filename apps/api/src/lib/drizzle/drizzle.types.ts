import { db } from "@/lib/drizzle";

export interface ToCollectionOptions {
  overrideCount?: number;
}

export type DbErrorType =
  "NOT_FOUND" | "DATABASE_ERROR" | "VALIDATION_ERROR" | "CONFLICT";

export type DbResult<T> =
  | { ok: true; data: T; reason?: never; type?: never }
  | { ok: false; data: null; reason: string; type: DbErrorType };

export interface DbCollection<T> {
  data: T[];
  count: number;
  isEmpty: boolean;
}

export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

export type DbError = { type: DbErrorType; reason: string };

export type PgTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

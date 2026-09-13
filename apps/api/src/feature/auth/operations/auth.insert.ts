import { db } from "@/lib/drizzle";
import type { DbResult } from "@/lib/drizzle/drizzle.types";
import { executeSingle } from "@/lib/drizzle/results/results.single";

import { authEventsSchema, sessionsSchema } from "../auth.schema";
import { hashToken } from "../auth.tokens";
import type {
  AuthEvent,
  InsertAuthEventInput,
  InsertSessionInput,
  Session,
} from "../auth.types";

export async function insertAuthEvent(
  data: InsertAuthEventInput,
): Promise<DbResult<AuthEvent>> {
  return executeSingle(
    db
      .insert(authEventsSchema)
      .values({
        userId: data.userId,
        eventType: data.eventType,
        createdAt: data.createdAt,
      })
      .returning()
      .then((result) => result[0]),
  );
}

export const insertSession = async ({
  sessionId,
  userId,
  refreshToken,
}: InsertSessionInput): Promise<DbResult<Session>> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  return executeSingle(
    db
      .insert(sessionsSchema)
      .values({
        userId,
        expiresAt,
        id: sessionId,
        refreshTokenHash: hashToken(refreshToken),
      })
      .returning()
      .then((result) => result[0]),
  );
};

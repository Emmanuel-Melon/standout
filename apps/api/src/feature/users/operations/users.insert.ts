
import { v4 as uuid } from "uuid";

import { db } from "@/lib/drizzle";
import type { DbResult } from "@/lib/drizzle/drizzle.types";
import { executeSingle } from "@/lib/drizzle/results/results.single";

import { usersSchema } from "../users.schema";
import type { NewUser, User } from "../users.types";

export async function insertUser(userData: NewUser): Promise<DbResult<User>> {
  return executeSingle(
    db
      .insert(usersSchema)
      .values({
        id: uuid(),
        name: userData.name ?? null,
        email: userData.email ?? null,
        password: userData.password ?? null,
      })
      .returning()
      .then(([user]) => user),
  );
}

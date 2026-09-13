import { eq } from "drizzle-orm";

import { db } from "@/lib/drizzle";
import type { DbResult } from "@/lib/drizzle/drizzle.types";
import { executeSingle } from "@/lib/drizzle/results/results.single";

import { usersSchema } from "../users.schema";
import type { User, UserColumn, UserColumnKey } from "../users.types";

export const findUser = <K extends UserColumnKey>(
  field: K,
  value: UserColumn[K]["_"]["data"],
): Promise<DbResult<User>> =>
  executeSingle(
    db.query.usersSchema.findFirst({
      where: eq(usersSchema[field], value),
      columns: { password: false },
    }),
  );

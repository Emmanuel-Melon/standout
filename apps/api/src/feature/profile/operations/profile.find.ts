import { eq } from "drizzle-orm";

import { db } from "@/lib/drizzle";
import type { DbResult } from "@/lib/drizzle/drizzle.types";
import { executeSingle } from "@/lib/drizzle/results/results.single";

import { profiles } from "../profile.schema";
import type {
  Profile,
  ProfileColumn,
  ProfileColumnKey,
} from "../profile.types";

export const findProfile = <K extends ProfileColumnKey>(
  field: K,
  value: ProfileColumn[K]["_"]["data"],
): Promise<DbResult<Profile>> =>
  executeSingle(
    db.query.profiles.findFirst({
      where: eq(profiles[field], value),
    }),
  );

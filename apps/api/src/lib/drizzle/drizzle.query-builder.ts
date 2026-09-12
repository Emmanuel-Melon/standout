import { asc, desc } from "drizzle-orm";

import { DbQueryOptions } from "@/types/query-options";

export function getPaginationConfig<T extends string>(
  options: DbQueryOptions<T>,
  schemaTable: Record<string, any>,
  defaultSortField: T,
) {
  const limit = options.limit ?? 10;
  const page = options.page ?? 1;
  const offset = (page - 1) * limit;

  const sortByField = options.sortBy ?? defaultSortField;
  const sortDirection = options.sortOrder === "asc" ? asc : desc;
  const finalOrderBy = sortDirection(schemaTable[sortByField]);

  return { limit, offset, orderBy: finalOrderBy };
}

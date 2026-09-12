import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z, ZodRawShape } from "zod";

extendZodWithOpenApi(z);

export const MetadataSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .openapi({
    title: "ResourceMetadata",
    description:
      "Key-value pair object holding custom non-relational metadata strings or flags.",
    example: { department: "logistics", priority_handling: true },
  });

export type AnyZodObject = z.ZodObject<ZodRawShape>;

export function parseData<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown,
  context?: string,
): z.infer<TSchema> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const fields = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(context ? `${context} — ${fields}` : fields);
  }

  return result.data;
}

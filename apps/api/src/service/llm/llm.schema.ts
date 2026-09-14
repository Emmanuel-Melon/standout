import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { SchemaValidationResult } from "./llms.types";

export class SchemaValidator {
  /**
   * Validate content against a Zod schema
   */
  static validateContent(
    content: string,
    schema?: z.ZodSchema<any>,
  ): SchemaValidationResult {
    if (!schema) {
      return { isValid: true, parsedData: content };
    }

    try {
      // Try to parse as JSON first
      let data;
      try {
        data = JSON.parse(content);
      } catch {
        // If not JSON, use raw content
        data = content;
      }

      const parsedData = schema.parse(data);
      return { isValid: true, parsedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, errors: [error] };
      }
      return { isValid: false, errors: [] };
    }
  }

  /**
   * Convert Zod schema to JSON schema for inclusion in prompts
   */
  static schemaToJSON(schema: z.ZodSchema<any>): object {
    return zodToJsonSchema(schema as never);
  }

  /**
   * Generate a system prompt for schema validation
   */
  static generateSchemaPrompt(schema: z.ZodSchema<any>): string {
    const jsonSchema = this.schemaToJSON(schema);

    return `You MUST format your response as JSON that matches the following schema:\n\n${JSON.stringify(jsonSchema, null, 2)}\n\nEnsure the output is valid JSON and conforms exactly to this structure.`;
  }

  static generateTypeScriptDefinition(schema: z.ZodSchema<any>): string {
    // This is a simplified version - you might want to enhance this
    // based on your specific schema types
    const jsonSchema = zodToJsonSchema(schema as never);
    return `Your response must be valid JSON matching this structure:\n\`\`\`typescript\n${JSON.stringify(jsonSchema, null, 2)}\n\`\`\``;
  }
}

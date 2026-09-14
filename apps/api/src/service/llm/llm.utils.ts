import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import type { LLMProviderName } from "./llm.config";
import { FormattedRequest, Message } from "./llms.types";

/**
 * Extracts the first JSON value from a model response that may wrap the JSON
 * in markdown code fences (e.g. ```json ... ```) or include surrounding
 * prose. Falls back to the raw string when no JSON value can be isolated.
 */
export function extractJson(raw: string): string {
  const content = raw.trim();

  // Strip a leading markdown code-fence block (e.g. ```json / ```).
  const fenced = content.match(/^```[a-zA-Z]*\s*([\s\S]*?)```\s*$/);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  // Otherwise, try to isolate the first JSON object or array in the output.
  const start = content.search(/[[{]/);
  if (start === -1) {
    return content;
  }
  const open = content[start];
  const close = open === "{" ? "}" : "]";
  const end = content.lastIndexOf(close);
  if (end > start) {
    return content.slice(start, end + 1);
  }

  return content;
}

/**
 * Safely parses and validates text content against an optional Zod schema.
 */
export function parseAndValidateContent<T = string>(
  content: string,
  schema?: z.ZodTypeAny,
): T {
  if (!schema) {
    return content as unknown as T;
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(extractJson(content));
  } catch (e) {
    throw new Error(`Failed to parse JSON response from LLM: ${e}`);
  }

  return schema.parse(parsedJson) as T;
}

export function formatMessagesForProvider(
  provider: LLMProviderName,
  messages: Message[],
  options: {
    systemPrompt?: string;
    responseSchema?: z.ZodSchema<any>;
    responseFormat?: "text" | "json";
    [key: string]: any;
  } = {},
): FormattedRequest {
  const { systemPrompt, responseSchema, responseFormat, ...otherOptions } =
    options;
  const baseOptions: Record<string, any> = { ...otherOptions };

  if (responseSchema) {
    const jsonSchema = zodToJsonSchema(responseSchema as never);
    if (provider === "ollama") {
      baseOptions.responseSchema = jsonSchema;
      baseOptions.responseFormat = "json";
    }
  } else if (responseFormat) {
    baseOptions.responseFormat = responseFormat;
  }

  let formattedMessages: any;
  switch (provider) {
    case "ollama": {
      const formatted = [...messages];

      if (systemPrompt) {
        formatted.unshift({
          role: "system",
          content: systemPrompt,
        });
      }

      return {
        messages: formatted,
        options: baseOptions,
      };
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function buildRequestConfig(
  provider: LLMProviderName,
  messages: any,
  options: Record<string, any> = {},
): any {
  switch (provider) {
    case "ollama": {
      return {
        messages,
        ...options,
      };
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

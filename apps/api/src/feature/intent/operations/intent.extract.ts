import { llmClientProvider } from "@/service/llm";

import { intentExtractionConfig } from "../intent.config";
import { INTENT_SYSTEM_PROMPT } from "../intent.prompt";
import { queryIntentSchema, type RawIntentOutput } from "../intent.types";

export async function extractIntent(message: string): Promise<RawIntentOutput> {
  llmClientProvider.setSystemPrompt(INTENT_SYSTEM_PROMPT);

  const response = await llmClientProvider.generateTextContent<RawIntentOutput>(
    message,
    {
      model: intentExtractionConfig.model,
      outputType: "structured",
      responseJsonSchema: queryIntentSchema,
    },
  );

  return response.content;
}

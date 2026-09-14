import { HttpStatus } from "@/lib/http/http.status";

import { LlmErrorCode, LlmErrorConfig } from "./llms.types";

export const LlmErrors: Record<LlmErrorCode, LlmErrorConfig> = {
  CONTEXT_WINDOW_EXCEEDED: {
    ...HttpStatus.BAD_REQUEST,
    code: "CONTEXT_WINDOW_EXCEEDED",
    description: "The input tokens exceed the model's capacity. ",
  },
  RATE_LIMIT_REACHED: {
    ...HttpStatus.TOO_MANY_REQUESTS,
    code: "RATE_LIMIT_REACHED",
    description: "You have sent too many requests in a short period.",
  },
  SAFETY_VIOLATION: {
    ...HttpStatus.FORBIDDEN,
    code: "SAFETY_VIOLATION",
    description: "The prompt or output triggered safety filters.",
  },
  INVALID_MODEL: {
    ...HttpStatus.NOT_FOUND,
    code: "INVALID_MODEL",
    description:
      "The requested model version does not exist or is unsupported.",
  },
  INSUFFICIENT_QUOTA: {
    ...HttpStatus.PAYMENT_REQUIRED,
    code: "INSUFFICIENT_QUOTA",
    description: "You have exceeded your credit limit or quota.",
  },
} as const;

export const LLM_PROVIDERS = {
  OLLAMA: {
    NAME: "ollama" as const,
    MODELS: {
      GEMMA3_1B: "gemma3:1b",
    },
    DEFAULT_MODEL: "gemma3:1b",
  },
} as const;

export type LLMProviderName =
  (typeof LLM_PROVIDERS)[keyof typeof LLM_PROVIDERS]["NAME"];
export type OllamaModel =
  (typeof LLM_PROVIDERS.OLLAMA.MODELS)[keyof typeof LLM_PROVIDERS.OLLAMA.MODELS];
export type LLMModel = OllamaModel;

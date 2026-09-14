import { z } from "zod";

import { StatusConfig } from "@/lib/http/http.types";

import { type LLMProviderName } from "./llm.config";

/*
 * MESSAGE & ROLE TYPES
 */
export type MessageRole = "system" | "user" | "assistant" | "function";

export interface Message {
  role: MessageRole;
  content: string;
  name?: string;
}

/*
 * CONFIGURATION & OUTPUT TYPES
 */
export type LLMOutputType = "text" | "structured";

export interface BaseLLMOutputConfig {
  responseJsonSchema?: z.ZodTypeAny;
  schemaName?: string;
  outputType?: LLMOutputType;
  provider?: LLMProviderName;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLmOutputConfig extends BaseLLMOutputConfig {
  responseMimeType?: string;
}

/*
 * PROVIDER CONTRACT INTERFACES
 */
export interface LLMResponse<T = any> {
  content: T;
  provider: LLMProviderName;
  contentType: LLMOutputType;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMStreamResponse extends Omit<LLMResponse, "content"> {
  fullContent: string;
}

export interface ILLMProvider<TProvider extends LLMProviderName> {
  provider: TProvider;
  model?: string;
  systemPrompt?: string;

  generateTextContent<T = string>(
    prompt: string,
    config?: LLmOutputConfig,
  ): Promise<LLMResponse<T>>;

  generateStreamContent(
    prompt: string,
    onToken: (token: string) => void,
    config?: LLmOutputConfig,
  ): Promise<LLMStreamResponse>;

  setSystemPrompt(systemPrompt: string): void;
  getSystemPrompt(): string | undefined;
}

export interface IBaseLLMProvider {
  provider?: LLMProviderName;
  model?: string;
  systemPrompt?: string;

  generateTextContent<T = string>(
    prompt: string,
    config?: LLmOutputConfig,
  ): Promise<LLMResponse<T>>;

  generateStreamContent(
    prompt: string,
    onToken: (token: string) => void,
    config?: LLmOutputConfig,
  ): Promise<LLMStreamResponse>;

  setSystemPrompt(systemPrompt: string): void;
  getSystemPrompt(): string | undefined;
}

export interface IllmClientProvider extends ILLMProvider<LLMProviderName> {
  setProvider(provider: LLMProviderName): void;
}

/*
 * ERROR & UTILITY TYPES
 */
export type LlmErrorCode =
  | "CONTEXT_WINDOW_EXCEEDED"
  | "RATE_LIMIT_REACHED"
  | "SAFETY_VIOLATION"
  | "INVALID_MODEL"
  | "INSUFFICIENT_QUOTA";

export interface LlmErrorConfig extends StatusConfig {
  code: LlmErrorCode;
}

export interface FormattedRequest {
  messages: any;
  options: Record<string, any>;
}

export interface SchemaValidationResult {
  isValid: boolean;
  errors?: z.ZodError[];
  parsedData?: any;
}

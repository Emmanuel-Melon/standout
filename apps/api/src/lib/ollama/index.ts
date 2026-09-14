import { Ollama } from "ollama";

import { llmConfig } from "@/config";
import { LLM_PROVIDERS } from "@/service/llm/llm.config";
import { parseAndValidateContent } from "@/service/llm/llm.utils";
import {
  ILLMProvider,
  LLmOutputConfig,
  LLMResponse,
  LLMStreamResponse,
  Message,
} from "@/service/llm/llms.types";

export interface OllamaProviderConfig {
  model?: string;
  systemPrompt?: string;
  host?: string;
}

export class OllamaClient implements ILLMProvider<"ollama"> {
  private static instance: OllamaClient;
  private client: Ollama;
  readonly model: string;
  readonly provider: "ollama";
  private _systemPrompt: string;

  private constructor(config: OllamaProviderConfig = {}) {
    this.provider = "ollama";
    this.model = config.model || LLM_PROVIDERS.OLLAMA.DEFAULT_MODEL;
    this._systemPrompt = config.systemPrompt || "";

    const ollamaConfig = {
      host: config.host || llmConfig.ollama.url,
    };
    this.client = new Ollama(ollamaConfig);
  }

  public static getInstance(config: OllamaProviderConfig = {}): OllamaClient {
    if (!OllamaClient.instance) {
      OllamaClient.instance = new OllamaClient(config);
    }
    return OllamaClient.instance;
  }

  public get systemPrompt(): string | undefined {
    return this._systemPrompt || undefined;
  }

  public setSystemPrompt(prompt: string): void {
    this._systemPrompt = prompt;
  }

  public getSystemPrompt(): string | undefined {
    return this._systemPrompt || undefined;
  }

  public async chat(messages: Message[], model: string = this.model) {
    return this.client.chat({ model, messages });
  }

  public async generateTextContent<T = string>(
    prompt: string,
    config: LLmOutputConfig = {},
  ): Promise<LLMResponse<T>> {
    const { responseJsonSchema, outputType = "text" } = config;

    const messages = [
      ...(this._systemPrompt
        ? [{ role: "system" as const, content: this._systemPrompt }]
        : []),
      { role: "user" as const, content: prompt },
    ];

    const response = await this.client.chat({
      model: this.model,
      messages,
      stream: false,
      ...(outputType === "structured" && { format: "json" }),
    });

    const content = response.message?.content;
    if (!content) {
      throw new Error("Invalid response from Ollama: no content returned");
    }

    const parsedContent =
      outputType === "structured"
        ? parseAndValidateContent<T>(content, responseJsonSchema)
        : (content as unknown as T);

    return {
      content: parsedContent,
      provider: this.provider,
      contentType: outputType,
    };
  }

  public async generateStreamContent(
    prompt: string,
    onToken: (token: string) => void,
    _config: LLmOutputConfig = {},
  ): Promise<LLMStreamResponse> {
    const messages = [
      ...(this._systemPrompt
        ? [{ role: "system" as const, content: this._systemPrompt }]
        : []),
      { role: "user" as const, content: prompt },
    ];

    const stream = await this.client.chat({
      model: this.model,
      messages,
      stream: true,
    });

    let fullContent = "";

    for await (const chunk of stream) {
      const token = chunk.message?.content;
      if (token) {
        fullContent += token;
        onToken(token);
      }
    }

    return {
      fullContent,
      provider: this.provider,
      contentType: "text" as const,
    };
  }
}

export const ollamaClient = OllamaClient.getInstance({
  host: llmConfig.ollama.url,
  model: llmConfig.ollama.model || LLM_PROVIDERS.OLLAMA.DEFAULT_MODEL,
});

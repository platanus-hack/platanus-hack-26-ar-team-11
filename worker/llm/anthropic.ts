import {
  DEFAULT_API_CONNECT_OPTIONS,
  llm,
  type APIConnectOptions,
} from "@livekit/agents";
import Anthropic from "@anthropic-ai/sdk";

export type AnthropicLLMOptions = {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

const DEFAULTS = {
  model: "claude-sonnet-4-6",
  temperature: 0.7,
  maxTokens: 256,
};

type ResolvedOpts = Required<Omit<AnthropicLLMOptions, "apiKey">>;

export class AnthropicLLM extends llm.LLM {
  private client: Anthropic;
  private opts: ResolvedOpts;

  constructor(opts: AnthropicLLMOptions = {}) {
    super();
    const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "AnthropicLLM: ANTHROPIC_API_KEY is required (env or opts.apiKey)"
      );
    }
    this.client = new Anthropic({ apiKey });
    this.opts = {
      model: opts.model ?? DEFAULTS.model,
      temperature: opts.temperature ?? DEFAULTS.temperature,
      maxTokens: opts.maxTokens ?? DEFAULTS.maxTokens,
    };
  }

  override label(): string {
    return "anthropic.LLM";
  }

  override get model(): string {
    return this.opts.model;
  }

  override get provider(): string {
    return "api.anthropic.com";
  }

  override chat({
    chatCtx,
    toolCtx,
    connOptions = DEFAULT_API_CONNECT_OPTIONS,
  }: {
    chatCtx: llm.ChatContext;
    toolCtx?: llm.ToolContext;
    connOptions?: APIConnectOptions;
    parallelToolCalls?: boolean;
    toolChoice?: llm.ToolChoice;
    extraKwargs?: Record<string, unknown>;
  }): llm.LLMStream {
    return new AnthropicLLMStream(this, this.client, this.opts, {
      chatCtx,
      toolCtx,
      connOptions,
    });
  }
}

class AnthropicLLMStream extends llm.LLMStream {
  private client: Anthropic;
  private modelOpts: ResolvedOpts;

  constructor(
    parent: llm.LLM,
    client: Anthropic,
    modelOpts: ResolvedOpts,
    args: {
      chatCtx: llm.ChatContext;
      toolCtx?: llm.ToolContext;
      connOptions: APIConnectOptions;
    }
  ) {
    super(parent, args);
    this.client = client;
    this.modelOpts = modelOpts;
  }

  protected async run(): Promise<void> {
    const { system, messages } = chatCtxToAnthropic(this.chatCtx);

    const stream = this.client.messages.stream({
      model: this.modelOpts.model,
      max_tokens: this.modelOpts.maxTokens,
      temperature: this.modelOpts.temperature,
      system: system || undefined,
      messages,
    });

    let chunkId = 0;

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        await this.queue.put({
          id: `anthropic-${chunkId++}`,
          delta: {
            role: "assistant",
            content: event.delta.text,
          },
        });
      }
    }

    const final = await stream.finalMessage();
    if (final.usage) {
      await this.queue.put({
        id: `anthropic-${chunkId++}`,
        usage: {
          completionTokens: final.usage.output_tokens ?? 0,
          promptTokens: final.usage.input_tokens ?? 0,
          promptCachedTokens:
            (final.usage as { cache_read_input_tokens?: number })
              .cache_read_input_tokens ?? 0,
          totalTokens:
            (final.usage.input_tokens ?? 0) +
            (final.usage.output_tokens ?? 0),
        },
      });
    }
  }
}

export function chatCtxToAnthropic(ctx: llm.ChatContext): {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
} {
  const systemParts: string[] = [];
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const item of ctx.items) {
    if (!("role" in item) || !("content" in item)) continue;
    const msg = item as { role: string; content: unknown };

    const text = extractText(msg.content);
    if (!text) continue;

    if (msg.role === "system" || msg.role === "developer") {
      systemParts.push(text);
    } else if (msg.role === "user" || msg.role === "assistant") {
      const last = messages[messages.length - 1];
      if (last && last.role === msg.role) {
        last.content += "\n\n" + text;
      } else {
        messages.push({ role: msg.role, content: text });
      }
    }
  }

  if (messages.length === 0 || messages[0].role !== "user") {
    messages.unshift({ role: "user", content: "(empieza la conversación)" });
  }

  return { system: systemParts.join("\n\n"), messages };
}

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c) => (typeof c === "string" ? c : ""))
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  return "";
}

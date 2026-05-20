import "server-only";

const DEFAULT_BASE = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-4";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatRequest = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
};

export type ChatResponse = {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

export function isConfigured(): boolean {
  return Boolean(process.env.GROK_API_KEY);
}

export function configuredModel(): string {
  return process.env.GROK_MODEL || DEFAULT_MODEL;
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY not configured");
  const baseUrl = process.env.GROK_BASE_URL || DEFAULT_BASE;
  const model = configuredModel();

  const body: Record<string, unknown> = {
    model,
    messages: req.messages,
    temperature: req.temperature ?? 0.5,
    max_tokens: req.maxTokens ?? 6000,
  };
  if (req.jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`grok api ${res.status}: ${text.slice(0, 600)}`);
  }

  const json = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
    model: string;
    usage?: ChatResponse["usage"];
  };

  return {
    content: json.choices[0]?.message?.content ?? "",
    model: json.model,
    usage: json.usage,
  };
}

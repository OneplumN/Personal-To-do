export type ChatMessage = {
  content: string;
  role: "system" | "user";
};

export type ChatCompletionRequestInput = {
  extraBodyJson?: string;
  messages: ChatMessage[];
  model: string;
  temperature?: number;
};

export type ChatCompletionRequest = {
  messages: ChatMessage[];
  model: string;
  temperature: number;
} & Record<string, unknown>;

export type ChatCompletionOptions = ChatCompletionRequestInput & {
  apiKey?: string;
  endpoint: string;
};

export type ApiTestResult =
  | {
      content: string;
      elapsedMs: number;
      ok: true;
      status: number;
    }
  | {
      elapsedMs: number;
      error: string;
      ok: false;
      status: number;
    };

export type ModelListResult =
  | {
      models: string[];
      ok: true;
      status: number;
    }
  | {
      error: string;
      ok: false;
      status: number;
    };

function getNetworkErrorMessage(error: unknown) {
  if (!(error instanceof TypeError) || error.message !== "Failed to fetch") {
    return error instanceof Error ? error.message : "Unknown network error";
  }

  return "Cannot reach this API from the browser. Check the endpoint, network, and whether the service allows browser requests.";
}

export function normalizeChatCompletionsEndpoint(endpoint: string) {
  const trimmedEndpoint = endpoint.trim().replace(/\/+$/, "");

  if (trimmedEndpoint.endsWith("/chat/completions")) {
    return trimmedEndpoint;
  }

  return `${trimmedEndpoint}/chat/completions`;
}

export function normalizeModelsEndpoint(endpoint: string) {
  const trimmedEndpoint = endpoint.trim().replace(/\/+$/, "");

  if (trimmedEndpoint.endsWith("/models")) {
    return trimmedEndpoint;
  }

  if (trimmedEndpoint.endsWith("/chat/completions")) {
    return `${trimmedEndpoint.slice(0, -"/chat/completions".length)}/models`;
  }

  return `${trimmedEndpoint}/models`;
}

export function parseExtraBodyJson(extraBodyJson?: string) {
  const trimmedJson = extraBodyJson?.trim();
  if (!trimmedJson) {
    return {};
  }

  const parsed = JSON.parse(trimmedJson) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Advanced JSON must be an object.");
  }

  return parsed as Record<string, unknown>;
}

export function buildChatCompletionRequest({
  extraBodyJson,
  messages,
  model,
  temperature = 0.3,
}: ChatCompletionRequestInput): ChatCompletionRequest {
  const trimmedModel = model.trim();
  if (!trimmedModel) {
    throw new Error("Model is required.");
  }

  return {
    messages,
    model: trimmedModel,
    temperature,
    ...parseExtraBodyJson(extraBodyJson),
  };
}

export function buildRequestPreview(options: ChatCompletionOptions) {
  return {
    body: buildChatCompletionRequest(options),
    headers: {
      Authorization: options.apiKey?.trim() ? "Bearer sk-****" : "",
      "Content-Type": "application/json",
    },
    url: normalizeChatCompletionsEndpoint(options.endpoint),
  };
}

function buildProxyPayload(options: ChatCompletionOptions) {
  return {
    apiKey: options.apiKey,
    body: buildChatCompletionRequest(options),
    endpoint: options.endpoint,
  };
}

async function fetchJsonThroughProxy(path: "/api/ai/chat-completions" | "/api/ai/models", payload: unknown) {
  return fetch(path, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

export function parseChatCompletionContent(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const outputText = "output_text" in payload ? payload.output_text : undefined;
  if (typeof outputText === "string" && outputText.trim()) {
    return outputText.trim();
  }

  const choices = "choices" in payload ? payload.choices : undefined;
  if (!Array.isArray(choices)) {
    return "";
  }

  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== "object") {
    return "";
  }

  const message = "message" in firstChoice ? firstChoice.message : undefined;
  if (message && typeof message === "object") {
    const content = "content" in message ? message.content : undefined;
    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (!part || typeof part !== "object") {
            return "";
          }
          const text = "text" in part ? part.text : undefined;
          return typeof text === "string" ? text : "";
        })
        .filter(Boolean)
        .join("\n")
        .trim();
    }
  }

  const text = "text" in firstChoice ? firstChoice.text : undefined;
  return typeof text === "string" ? text.trim() : "";
}

export async function requestChatCompletion(options: ChatCompletionOptions) {
  const response = await fetchJsonThroughProxy(
    "/api/ai/chat-completions",
    buildProxyPayload(options),
  );

  if (!response.ok) {
    throw new Error(`AI request failed (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  const content = parseChatCompletionContent(payload);

  if (!content) {
    throw new Error("AI response did not include content");
  }

  return content;
}

export async function testChatCompletion(options: {
  apiKey?: string;
  endpoint: string;
  extraBodyJson?: string;
  model: string;
}): Promise<ApiTestResult> {
  const startedAt = performance.now();

  try {
    const response = await fetchJsonThroughProxy("/api/ai/chat-completions", {
      apiKey: options.apiKey,
      body: buildChatCompletionRequest({
        extraBodyJson: options.extraBodyJson,
        messages: [{ content: "请只回复 OK", role: "user" }],
        model: options.model,
        temperature: 0,
      }),
      endpoint: options.endpoint,
    });
    const elapsedMs = Math.round(performance.now() - startedAt);
    const payload = (await response.json().catch(() => null)) as unknown;
    const content = parseChatCompletionContent(payload);

    if (!response.ok) {
      return {
        elapsedMs,
        error: JSON.stringify(payload ?? { error: response.statusText }, null, 2),
        ok: false,
        status: response.status,
      };
    }

    return {
      content: content || JSON.stringify(payload, null, 2),
      elapsedMs,
      ok: true,
      status: response.status,
    };
  } catch (error) {
    return {
      elapsedMs: Math.round(performance.now() - startedAt),
      error: getNetworkErrorMessage(error),
      ok: false,
      status: 0,
    };
  }
}

export async function fetchAvailableModels(options: {
  apiKey?: string;
  endpoint: string;
}): Promise<ModelListResult> {
  try {
    const response = await fetchJsonThroughProxy("/api/ai/models", {
      apiKey: options.apiKey,
      endpoint: options.endpoint,
    });
    const payload = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      return {
        error: JSON.stringify(payload ?? { error: response.statusText }, null, 2),
        ok: false,
        status: response.status,
      };
    }

    const data = payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : undefined;
    const models = Array.isArray(data)
      ? data
          .map((item) => {
            if (!item || typeof item !== "object" || !("id" in item)) {
              return "";
            }
            return typeof item.id === "string" ? item.id.trim() : "";
          })
          .filter(Boolean)
      : [];

    return {
      models: models.filter((model, index, allModels) => allModels.indexOf(model) === index),
      ok: true,
      status: response.status,
    };
  } catch (error) {
    return {
      error: getNetworkErrorMessage(error),
      ok: false,
      status: 0,
    };
  }
}

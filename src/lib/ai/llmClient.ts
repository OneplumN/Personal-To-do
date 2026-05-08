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
      url: string;
    }
  | {
      error: string;
      ok: false;
      status: number;
      url?: string;
    };

function collectModelIds(payload: unknown) {
  const modelIds = new Set<string>();

  function addModelId(candidate: unknown) {
    if (typeof candidate !== "string") {
      return;
    }
    const trimmedCandidate = candidate.trim();
    if (trimmedCandidate) {
      modelIds.add(trimmedCandidate);
    }
  }

  function visit(candidate: unknown) {
    if (typeof candidate === "string") {
      addModelId(candidate);
      return;
    }

    if (Array.isArray(candidate)) {
      candidate.forEach(visit);
      return;
    }

    if (!candidate || typeof candidate !== "object") {
      return;
    }

    const id = "id" in candidate ? candidate.id : undefined;
    const name = "name" in candidate ? candidate.name : undefined;
    const model = "model" in candidate ? candidate.model : undefined;
    addModelId(id);
    addModelId(name);
    addModelId(model);
  }

  if (payload && typeof payload === "object") {
    const data = "data" in payload ? payload.data : undefined;
    const models = "models" in payload ? payload.models : undefined;
    visit(data);
    visit(models);
  } else {
    visit(payload);
  }

  return [...modelIds];
}

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

export function getCandidateChatCompletionsEndpoints(endpoint: string) {
  const trimmedEndpoint = endpoint.trim().replace(/\/+$/, "");
  if (!trimmedEndpoint) {
    return [];
  }

  if (trimmedEndpoint.endsWith("/chat/completions")) {
    return [trimmedEndpoint];
  }

  const candidates = trimmedEndpoint.endsWith("/v1")
    ? [`${trimmedEndpoint}/chat/completions`]
    : [
        normalizeChatCompletionsEndpoint(trimmedEndpoint),
        `${trimmedEndpoint}/v1/chat/completions`,
      ];

  return candidates.filter(
    (candidate, index, allCandidates) => allCandidates.indexOf(candidate) === index,
  );
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

export function getCandidateModelsEndpoints(endpoint: string, modelsEndpoint?: string) {
  const trimmedModelsEndpoint = modelsEndpoint?.trim().replace(/\/+$/, "");
  if (trimmedModelsEndpoint) {
    return [trimmedModelsEndpoint];
  }

  const trimmedEndpoint = endpoint.trim().replace(/\/+$/, "");
  if (!trimmedEndpoint) {
    return [];
  }

  const candidates = trimmedEndpoint.endsWith("/v1")
    ? [`${trimmedEndpoint}/models`]
    : [
        `${trimmedEndpoint}/v1/models`,
        normalizeModelsEndpoint(trimmedEndpoint),
      ];

  return candidates.filter(
    (candidate, index, allCandidates) => allCandidates.indexOf(candidate) === index,
  );
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

async function fetchChatCompletion(options: ChatCompletionOptions, chatEndpoint?: string) {
  if (import.meta.env.DEV) {
    return fetchJsonThroughProxy("/api/ai/chat-completions", {
      ...buildProxyPayload(options),
      chatEndpoint,
    });
  }

  return fetch(chatEndpoint ?? normalizeChatCompletionsEndpoint(options.endpoint), {
    body: JSON.stringify(buildChatCompletionRequest(options)),
    headers: {
      ...(options.apiKey?.trim() ? { Authorization: `Bearer ${options.apiKey.trim()}` } : {}),
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

async function readJsonPayload(response: Response) {
  if (typeof response.text !== "function" && typeof response.json === "function") {
    return (await response.json()) as unknown;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    const contentType = response.headers.get("Content-Type") || "unknown content-type";
    const preview = text.replace(/\s+/g, " ").trim().slice(0, 160);
    throw new Error(
      `AI 服务返回的不是 JSON（${response.status} ${contentType}）。请检查服务地址是否指向 OpenAI 兼容接口；返回内容预览：${preview}`,
    );
  }
}

function getResponseErrorMessage(payload: unknown, response: Response) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = payload.error;
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object" && "message" in error) {
      const message = error.message;
      if (typeof message === "string") {
        return message;
      }
    }
  }

  return JSON.stringify(payload ?? { error: response.statusText }, null, 2);
}

async function fetchModels(options: { apiKey?: string; endpoint: string; url: string }) {
  if (import.meta.env.DEV) {
    return fetchJsonThroughProxy("/api/ai/models", {
      apiKey: options.apiKey,
      endpoint: options.endpoint,
      modelsEndpoint: options.url,
    });
  }

  return fetch(options.url, {
    headers: {
      ...(options.apiKey?.trim() ? { Authorization: `Bearer ${options.apiKey.trim()}` } : {}),
    },
    method: "GET",
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
  const chatEndpoints = getCandidateChatCompletionsEndpoints(options.endpoint);
  let lastError: Error | null = null;

  for (const chatEndpoint of chatEndpoints) {
    try {
      const response = await fetchChatCompletion(options, chatEndpoint);
      const payload = await readJsonPayload(response);

      if (!response.ok) {
        throw new Error(`AI request failed (${response.status}): ${getResponseErrorMessage(payload, response)}`);
      }

      const content = parseChatCompletionContent(payload);

      if (!content) {
        throw new Error("AI response did not include content");
      }

      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("AI request failed.");
      if (!lastError.message.includes("AI 服务返回的不是 JSON")) {
        break;
      }
    }
  }

  throw lastError ?? new Error("AI endpoint is required.");
}

export async function testChatCompletion(options: {
  apiKey?: string;
  endpoint: string;
  extraBodyJson?: string;
  model: string;
}): Promise<ApiTestResult> {
  const startedAt = performance.now();

  try {
    const response = await fetchChatCompletion({
      apiKey: options.apiKey,
      endpoint: options.endpoint,
      extraBodyJson: options.extraBodyJson,
      messages: [{ content: "请只回复 OK", role: "user" }],
      model: options.model,
      temperature: 0,
    });
    const elapsedMs = Math.round(performance.now() - startedAt);
    const payload = await readJsonPayload(response).catch((error) => {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return null;
    });
    const content = parseChatCompletionContent(payload);

    if (!response.ok) {
      return {
        elapsedMs,
        error: getResponseErrorMessage(payload, response),
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
  modelsEndpoint?: string;
}): Promise<ModelListResult> {
  const urls = getCandidateModelsEndpoints(options.endpoint, options.modelsEndpoint);
  if (urls.length === 0) {
    return {
      error: "请先填写服务地址或模型列表地址。",
      ok: false,
      status: 0,
    };
  }

  let lastError: ModelListResult | null = null;

  for (const url of urls) {
  try {
    const response = await fetchModels({
      apiKey: options.apiKey,
      endpoint: options.endpoint,
      url,
    });
    const payload = await readJsonPayload(response).catch((error) => {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return null;
    });

    if (!response.ok) {
      lastError = {
        error: getResponseErrorMessage(payload, response),
        ok: false,
        status: response.status,
        url,
      };
      continue;
    }

    const models = collectModelIds(payload);
    return {
      models,
      ok: true,
      status: response.status,
      url,
    };
  } catch (error) {
    lastError = {
      error: getNetworkErrorMessage(error),
      ok: false,
      status: 0,
      url,
    };
  }
  }

  return lastError ?? {
    error: "没有可用的模型列表地址。",
    ok: false,
    status: 0,
  };
}

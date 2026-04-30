import { afterEach, describe, expect, test, vi } from "vitest";
import {
  buildRequestPreview,
  fetchAvailableModels,
  normalizeModelsEndpoint,
  testChatCompletion,
} from "../lib/ai/llmClient";

describe("llmClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("builds a masked request preview with extra body JSON", () => {
    const preview = buildRequestPreview({
      apiKey: "secret-key",
      endpoint: "https://api.deepseek.com",
      extraBodyJson: '{ "max_tokens": 800 }',
      messages: [{ content: "请只回复 OK", role: "user" }],
      model: "deepseek-chat",
      temperature: 0,
    });

    expect(preview.url).toBe("https://api.deepseek.com/chat/completions");
    expect(preview.headers.Authorization).toBe("Bearer sk-****");
    expect(preview.body.model).toBe("deepseek-chat");
    expect(preview.body.max_tokens).toBe(800);
  });

  test("tests a chat completion endpoint with a minimal OK request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await testChatCompletion({
      apiKey: "secret-key",
      endpoint: "https://api.moonshot.cn/v1",
      model: "kimi-k2-0905-preview",
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai/chat-completions",
      expect.objectContaining({
        method: "POST",
      }),
    );

    const [, requestInit] = fetchMock.mock.calls[0];
    const proxyPayload = JSON.parse(String(requestInit.body));
    expect(proxyPayload.apiKey).toBe("secret-key");
    expect(proxyPayload.endpoint).toBe("https://api.moonshot.cn/v1");
    expect(proxyPayload.body.model).toBe("kimi-k2-0905-preview");
    expect(proxyPayload.body.messages[0].content).toBe("请只回复 OK");
  });

  test("fetches model ids from an OpenAI-compatible models endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        data: [{ id: "deepseek-chat" }, { id: "deepseek-reasoner" }],
      }),
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(normalizeModelsEndpoint("https://api.deepseek.com/chat/completions")).toBe(
      "https://api.deepseek.com/models",
    );

    const result = await fetchAvailableModels({
      apiKey: "secret-key",
      endpoint: "https://api.deepseek.com",
    });

    expect(result).toEqual({
      models: ["deepseek-chat", "deepseek-reasoner"],
      ok: true,
      status: 200,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai/models",
      expect.objectContaining({
        method: "POST",
      }),
    );
    const [, requestInit] = fetchMock.mock.calls[0];
    const proxyPayload = JSON.parse(String(requestInit.body));
    expect(proxyPayload).toEqual({
      apiKey: "secret-key",
      endpoint: "https://api.deepseek.com",
    });
  });
});

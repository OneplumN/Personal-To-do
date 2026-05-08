import { afterEach, describe, expect, test, vi } from "vitest";
import {
  buildRequestPreview,
  fetchAvailableModels,
  requestChatCompletion,
  getCandidateModelsEndpoints,
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
      modelsEndpoint: "https://api.deepseek.com/models",
    });

    expect(result).toEqual({
      models: ["deepseek-chat", "deepseek-reasoner"],
      ok: true,
      status: 200,
      url: "https://api.deepseek.com/models",
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
      modelsEndpoint: "https://api.deepseek.com/models",
    });
  });

  test("tries v1 models for root custom endpoints before the plain models path", async () => {
    expect(getCandidateModelsEndpoints("https://code.heihuzi.ai/")).toEqual([
      "https://code.heihuzi.ai/v1/models",
      "https://code.heihuzi.ai/models",
    ]);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ data: [{ id: "gpt-5.5" }] }),
        ok: true,
        status: 200,
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAvailableModels({
      apiKey: "secret-key",
      endpoint: "https://code.heihuzi.ai/",
    });

    expect(result).toEqual({
      models: ["gpt-5.5"],
      ok: true,
      status: 200,
      url: "https://code.heihuzi.ai/v1/models",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("uses an explicit models endpoint without probing candidates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ data: [{ id: "custom-model" }] }),
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAvailableModels({
      apiKey: "secret-key",
      endpoint: "https://code.heihuzi.ai",
      modelsEndpoint: "https://code.heihuzi.ai/openai/v1/models",
    });

    expect(result).toEqual({
      models: ["custom-model"],
      ok: true,
      status: 200,
      url: "https://code.heihuzi.ai/openai/v1/models",
    });
    const [, requestInit] = fetchMock.mock.calls[0];
    const proxyPayload = JSON.parse(String(requestInit.body));
    expect(proxyPayload.modelsEndpoint).toBe(
      "https://code.heihuzi.ai/openai/v1/models",
    );
  });

  test("retries v1 chat completions when a root endpoint returns html", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        headers: new Headers({ "Content-Type": "text/html" }),
        ok: true,
        status: 200,
        text: async () => "<!doctype html><html>not the api</html>",
      })
      .mockResolvedValueOnce({
        headers: new Headers({ "Content-Type": "application/json" }),
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            choices: [{ message: { content: "polished report" } }],
          }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestChatCompletion({
      apiKey: "secret-key",
      endpoint: "https://code.heihuzi.ai",
      messages: [{ content: "报告", role: "user" }],
      model: "gpt-5.5",
    });

    expect(result).toBe("polished report");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, firstRequestInit] = fetchMock.mock.calls[0];
    const [, secondRequestInit] = fetchMock.mock.calls[1];
    expect(JSON.parse(String(firstRequestInit.body)).chatEndpoint).toBe(
      "https://code.heihuzi.ai/chat/completions",
    );
    expect(JSON.parse(String(secondRequestInit.body)).chatEndpoint).toBe(
      "https://code.heihuzi.ai/v1/chat/completions",
    );
  });

  test("fetches model ids from common custom provider response shapes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        models: ["gpt-5.5", { name: "gpt-5.4" }, { model: "custom-chat" }],
      }),
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAvailableModels({
      apiKey: "secret-key",
      endpoint: "https://custom.example.com/v1",
    });

    expect(result).toEqual({
      models: ["gpt-5.5", "gpt-5.4", "custom-chat"],
      ok: true,
      status: 200,
      url: "https://custom.example.com/v1/models",
    });
  });
});

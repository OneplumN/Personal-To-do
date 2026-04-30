import { afterEach, describe, expect, test, vi } from "vitest";
import { polishReport } from "../lib/ai/polishReport";
import type { ReportDraft } from "../types/report";

const draft: ReportDraft = {
  blockers: ["暂无阻塞"],
  completedItems: ["项目：报告中心 / 标题：完成多模型对比"],
  keyChanges: ["接入模型输出"],
  nextSteps: ["保存最佳版本"],
  overview: "本期完成 1 项任务。",
};

describe("polishReport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("falls back to local template when endpoint is not configured", async () => {
    const report = await polishReport(draft, "custom", {
      modelName: "API 1",
    });

    expect(report).toMatch(/模型：API 1/);
    expect(report).toMatch(/完成多模型对比/);
  });

  test("calls an OpenAI-compatible chat completion endpoint when configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: "AI polished report" } }],
      }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    const report = await polishReport(draft, "custom", {
      extraBodyJson: '{ "max_tokens": 2000 }',
      apiKey: "secret-key",
      endpoint: "https://api.example.com/v1",
      modelName: "demo-model",
      rolePrompt: "Use a crisp executive tone.",
    });

    expect(report).toBe("AI polished report");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai/chat-completions",
      expect.objectContaining({
        method: "POST",
      }),
    );

    const [, requestInit] = fetchMock.mock.calls[0];
    const proxyPayload = JSON.parse(String(requestInit.body));
    expect(proxyPayload.apiKey).toBe("secret-key");
    expect(proxyPayload.endpoint).toBe("https://api.example.com/v1");
    expect(proxyPayload.body.model).toBe("demo-model");
    expect(proxyPayload.body.max_tokens).toBe(2000);
    expect(proxyPayload.body.messages[0].content).toBe("Use a crisp executive tone.");
    expect(proxyPayload.body.messages[1].content).toMatch(/完成多模型对比/);
  });
});

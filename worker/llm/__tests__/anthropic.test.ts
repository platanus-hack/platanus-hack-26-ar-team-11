import { describe, expect, it } from "vitest";
import type { llm } from "@livekit/agents";
import { chatCtxToAnthropic } from "../anthropic";

type Item = { role: string; content: unknown };

function ctx(items: Item[]): llm.ChatContext {
  return { items } as unknown as llm.ChatContext;
}

describe("chatCtxToAnthropic", () => {
  it("splits system/developer messages from user/assistant turns", () => {
    const out = chatCtxToAnthropic(
      ctx([
        { role: "system", content: "Sos cálida." },
        { role: "developer", content: "Mantenete corta." },
        { role: "user", content: "Hola" },
        { role: "assistant", content: "Hola, ¿cómo estás?" },
      ])
    );

    expect(out.system).toBe("Sos cálida.\n\nMantenete corta.");
    expect(out.messages).toEqual([
      { role: "user", content: "Hola" },
      { role: "assistant", content: "Hola, ¿cómo estás?" },
    ]);
  });

  it("coalesces consecutive same-role messages", () => {
    const out = chatCtxToAnthropic(
      ctx([
        { role: "user", content: "Hola" },
        { role: "user", content: "¿estás ahí?" },
        { role: "assistant", content: "Sí" },
      ])
    );

    expect(out.messages).toEqual([
      { role: "user", content: "Hola\n\n¿estás ahí?" },
      { role: "assistant", content: "Sí" },
    ]);
  });

  it("prepends a dummy user message when first turn is assistant", () => {
    const out = chatCtxToAnthropic(
      ctx([{ role: "assistant", content: "arranco yo" }])
    );

    expect(out.messages[0]).toEqual({
      role: "user",
      content: "(empieza la conversación)",
    });
    expect(out.messages[1]).toEqual({
      role: "assistant",
      content: "arranco yo",
    });
  });

  it("returns at least one user message even on an empty ctx", () => {
    const out = chatCtxToAnthropic(ctx([]));
    expect(out.system).toBe("");
    expect(out.messages).toEqual([
      { role: "user", content: "(empieza la conversación)" },
    ]);
  });

  it("handles array content shape from livekit", () => {
    const out = chatCtxToAnthropic(
      ctx([{ role: "user", content: ["hola", "che"] }])
    );
    expect(out.messages).toEqual([{ role: "user", content: "hola che" }]);
  });

  it("ignores items without role/content (function calls, handoffs)", () => {
    const out = chatCtxToAnthropic(
      ctx([
        { role: "user", content: "x" },
        // function call shape
        { name: "foo", args: {} } as unknown as Item,
      ])
    );
    expect(out.messages).toEqual([{ role: "user", content: "x" }]);
  });
});

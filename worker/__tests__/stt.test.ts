import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveSttProvider, sttModelLabel } from "../stt";

describe("stt provider resolution", () => {
  const originalProvider = process.env.STT_PROVIDER;

  beforeEach(() => {
    delete process.env.STT_PROVIDER;
  });

  afterEach(() => {
    if (originalProvider === undefined) {
      delete process.env.STT_PROVIDER;
    } else {
      process.env.STT_PROVIDER = originalProvider;
    }
  });

  it("defaults to deepgram when STT_PROVIDER is unset", () => {
    expect(resolveSttProvider()).toBe("deepgram");
  });

  it("returns elevenlabs (case-insensitive) when STT_PROVIDER=ELEVENLABS", () => {
    process.env.STT_PROVIDER = "ELEVENLABS";
    expect(resolveSttProvider()).toBe("elevenlabs");
  });

  it("falls back to deepgram for any unknown value", () => {
    process.env.STT_PROVIDER = "whisper";
    expect(resolveSttProvider()).toBe("deepgram");
  });

  it("maps providers to their model labels", () => {
    expect(sttModelLabel("deepgram")).toBe("nova-3");
    expect(sttModelLabel("elevenlabs")).toBe("scribe_v2_realtime");
  });
});

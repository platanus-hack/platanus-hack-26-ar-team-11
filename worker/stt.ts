import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as elevenlabs from "@livekit/agents-plugin-elevenlabs";
import type { stt as sttTypes } from "@livekit/agents";

export type SttProvider = "deepgram" | "elevenlabs";

export function resolveSttProvider(): SttProvider {
  const raw = (process.env.STT_PROVIDER ?? "deepgram").toLowerCase();
  return raw === "elevenlabs" ? "elevenlabs" : "deepgram";
}

export function sttModelLabel(provider: SttProvider): string {
  return provider === "elevenlabs" ? "scribe_v2_realtime" : "nova-3";
}

export function buildStt(provider: SttProvider = resolveSttProvider()): sttTypes.STT {
  if (provider === "elevenlabs") {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error(
        "ELEVENLABS_API_KEY is required when STT_PROVIDER=elevenlabs"
      );
    }
    console.log("[worker] STT: elevenlabs scribe_v2_realtime");
    return new elevenlabs.STT({
      apiKey: process.env.ELEVENLABS_API_KEY,
      modelId: "scribe_v2_realtime",
      languageCode: "es",
      useRealtime: true,
      tagAudioEvents: false,
      serverVad: {
        vadSilenceThresholdSecs: 0.1,
        minSpeechDurationMs: 100,
        minSilenceDurationMs: 100,
      },
    });
  }

  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY is required for deepgram STT");
  }

  console.log("[worker] STT: deepgram nova-3");
  return new deepgram.STT({
    apiKey: process.env.DEEPGRAM_API_KEY,
    model: "nova-3",
    language: "es",
    smartFormat: true,
    interimResults: true,
    endpointing: 10,
    noDelay: true,
  });
}

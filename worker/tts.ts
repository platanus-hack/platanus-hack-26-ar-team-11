import * as elevenlabs from "@livekit/agents-plugin-elevenlabs";
import type { tts as ttsTypes } from "@livekit/agents";

// Voice ID por defecto (Malena, español rioplatense). Si el env var no está
// seteado el worker usa este — el log es lo que avisa que cayó al default.
const DEFAULT_VOICE_ID = "p7AwDmKvTdoHTBuueGvP";

export function buildTts(): ttsTypes.TTS {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is required for ElevenLabs TTS");
  }

  let voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) {
    console.warn(
      `[worker] ELEVENLABS_VOICE_ID not set — falling back to default ${DEFAULT_VOICE_ID}`
    );
    voiceId = DEFAULT_VOICE_ID;
  }

  console.log(`[worker] TTS: elevenlabs eleven_flash_v2_5 voice=${voiceId}`);
  return new elevenlabs.TTS({
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId,
    model: "eleven_flash_v2_5",
    language: "es",
  });
}

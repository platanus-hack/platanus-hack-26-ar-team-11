import { fileURLToPath } from "node:url";
import {
  WorkerOptions,
  cli,
  defineAgent,
  type JobContext,
} from "@livekit/agents";
import * as silero from "@livekit/agents-plugin-silero";

export default defineAgent({
  prewarm: async (proc) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx: JobContext) => {
    console.log(`[worker] job started — room: ${ctx.room.name}`);
    await ctx.connect();
    console.log(`[worker] connected to room ${ctx.room.name}`);
  },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  cli.runApp(
    new WorkerOptions({
      agent: fileURLToPath(import.meta.url),
    })
  );
}

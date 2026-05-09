"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useDataChannel,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { CURRICULUM } from "@/lib/twin/curriculum";
import { AvatarStage } from "@/components/training/AvatarStage";
import { Lobby } from "@/components/training/Lobby";
import { SessionControls } from "@/components/training/SessionControls";
import {
  StateIndicator,
  type AgentState,
} from "@/components/training/StateIndicator";
import {
  TranscriptPane,
  type TranscriptItem,
} from "@/components/training/TranscriptPane";

type Status = "idle" | "connecting" | "live" | "ended" | "error";

interface ConnInfo {
  token: string;
  url: string;
  room: string;
}

interface DataEvent {
  type:
    | "transcript_user"
    | "transcript_assistant"
    | "agent_state"
    | "session_end";
  at?: string;
  text?: string;
  state?: AgentState;
  reason?: string;
}

export interface InterviewRoomProps {
  sessionId: string;
  twinId: string;
  sessionIndex: number;
  alreadyEnded: boolean;
}

export function InterviewRoom({
  sessionId,
  twinId,
  sessionIndex,
  alreadyEnded,
}: InterviewRoomProps) {
  const [status, setStatus] = useState<Status>(
    alreadyEnded ? "ended" : "idle"
  );
  const [conn, setConn] = useState<ConnInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          twin_id: twinId,
          session_index: sessionIndex,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `Token fetch failed (${res.status})`);
      }
      const data = (await res.json()) as ConnInfo;
      setConn(data);
      setStatus("live");
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
    }
  }, [sessionId, twinId, sessionIndex]);

  if (status === "ended") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Sesión terminada</h1>
        <p className="max-w-md text-sm text-neutral-600">
          Tu Twin está procesando lo que charlaron. Vas a ver los nuevos hechos
          en tu dashboard en un rato.
        </p>
        <a
          href="/dashboard"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
        >
          Volver al dashboard
        </a>
      </div>
    );
  }

  if (!conn || status !== "live") {
    const slot =
      CURRICULUM[Math.min(Math.max(sessionIndex, 0), CURRICULUM.length - 1)];
    return (
      <Lobby
        slot={slot}
        status={status === "live" ? "idle" : status}
        error={error}
        onStart={start}
      />
    );
  }

  return (
    <LiveKitRoom
      token={conn.token}
      serverUrl={conn.url}
      connect
      audio
      video={false}
      onDisconnected={() => setStatus("ended")}
      onError={(e) => {
        console.error("LiveKit error", e);
        setError(e.message);
        setStatus("error");
      }}
      className="mx-auto max-w-3xl px-4 py-6"
    >
      <RoomAudioRenderer />
      <Stage onEnd={() => setStatus("ended")} />
    </LiveKitRoom>
  );
}

function Stage({ onEnd }: { onEnd: () => void }) {
  const [agentState, setAgentState] = useState<AgentState>("initializing");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);

  useDataChannel((message) => {
    let event: DataEvent | null = null;
    try {
      event = JSON.parse(new TextDecoder().decode(message.payload)) as DataEvent;
    } catch {
      return;
    }
    if (!event) return;
    if (event.type === "agent_state" && event.state) {
      setAgentState(event.state);
    } else if (event.type === "transcript_user" && event.text && event.at) {
      setTranscript((prev) => [
        ...prev,
        { role: "user", text: event!.text!, at: event!.at! },
      ]);
    } else if (event.type === "transcript_assistant" && event.text && event.at) {
      setTranscript((prev) => [
        ...prev,
        { role: "assistant", text: event!.text!, at: event!.at! },
      ]);
    } else if (event.type === "session_end") {
      onEnd();
    }
  });

  // Failsafe: if no message ever lands, eventually flip from initializing.
  useEffect(() => {
    const t = setTimeout(() => {
      setAgentState((s) => (s === "initializing" ? "idle" : s));
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <AvatarStage />
        <div className="absolute right-3 top-3">
          <StateIndicator state={agentState} />
        </div>
      </div>

      <TranscriptPane items={transcript} />

      <SessionControls onEnd={onEnd} />
    </div>
  );
}

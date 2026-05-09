"use client";

import { useState } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { Button } from "@/components/ui/button";

export function SessionControls({ onEnd }: { onEnd?: () => void }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [muted, setMuted] = useState(false);

  const toggleMic = async () => {
    if (!localParticipant) return;
    const next = !muted;
    await localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);
  };

  const endSession = async () => {
    await room.disconnect();
    onEnd?.();
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleMic}
        aria-label={muted ? "Activar micrófono" : "Silenciar micrófono"}
      >
        {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>

      <Button type="button" variant="destructive" onClick={endSession}>
        <X className="mr-1.5 h-4 w-4" />
        Terminar sesión
      </Button>
    </div>
  );
}

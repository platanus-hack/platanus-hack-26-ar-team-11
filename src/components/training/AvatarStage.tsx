"use client";

import {
  VideoTrack,
  useParticipantTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic } from "lucide-react";

const BEY_AVATAR_IDENTITY = "bey-avatar-agent";

export function AvatarStage({ audioOnly = false }: { audioOnly?: boolean }) {
  const tracks = useParticipantTracks(
    [Track.Source.Camera],
    BEY_AVATAR_IDENTITY,
  );
  const trackRef = tracks[0];

  if (audioOnly) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-950">
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-neutral-300">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Mic className="h-6 w-6" />
          </div>
          <p className="text-sm tracking-wide">Modo audio · Cami sin avatar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-950">
      {trackRef ? (
        <VideoTrack
          trackRef={trackRef}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm tracking-wide text-neutral-400">
            Conectando con tu Twin…
          </p>
        </div>
      )}
    </div>
  );
}

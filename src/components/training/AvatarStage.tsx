"use client";

import {
  VideoTrack,
  useParticipantTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";

const BEY_AVATAR_IDENTITY = "bey-avatar-agent";

export function AvatarStage() {
  const tracks = useParticipantTracks(
    [Track.Source.Camera],
    BEY_AVATAR_IDENTITY
  );
  const trackRef = tracks[0];

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

# Worker — LiveKit voice agent

Sub-proyecto Node TS aparte de Next.js. Recibe jobs de LiveKit Cloud y maneja la pipeline de voz (STT → LLM → TTS → avatar).

## Run

```bash
pnpm worker            # dev mode (hot reload + verbose logs)
pnpm worker:start      # production mode
pnpm worker:download   # descarga modelos (Silero VAD, etc.)
```

El worker se queda escuchando jobs. Disparalo abriendo una room en LiveKit Cloud cuyo prefix matchee la config del agente.

## Env vars

Vive con el `.env.local` del root. Necesita:

- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`
- `DEEPGRAM_API_KEY`
- `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
- `BEY_API_KEY`, `NEXT_PUBLIC_BEY_AVATAR_ID`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (para persistir sesiones)
- `STT_PROVIDER` (opcional, `deepgram` por default)

## Verificar conexión

`pnpm worker` debe imprimir el handshake con LiveKit Cloud y quedarse esperando jobs sin error. Cuando una room real arranca, el log muestra `[worker] job started — room: <name>` seguido de `[worker] connected to room <name>`.

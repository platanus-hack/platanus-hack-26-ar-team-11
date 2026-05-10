# Twin Protocol — MVP setup para correr la demo

Está todo integrado: A (auth + dashboard) + B (worker LiveKit) + C (Connect API + permissions) + D (AllAccess landing + integración real).

## Requisitos

- **Node ≥ 22** (Vite 7 de AllAccess no anda en 20.17). `nvm install 22 && nvm use 22`.
- **pnpm ≥ 10** (`npm i -g pnpm`).

## 1. Twin Protocol (Next.js, puerto 3000)

```bash
cd platanus-hack-26-ar-team-11
cp .env.example .env.local
# Pedile a Manuel las keys y completá .env.local
pnpm install
pnpm db:seed     # crea demo users + AllAccess app
pnpm dev
```

Login: `demo1@twin-protocol.example` / `demo_twin_2026` (o `demo2@...` para Sofía).

## 2. Worker LiveKit (training de voz, opcional para la demo de AllAccess)

```bash
# en otra terminal, mismo dir
pnpm worker:download   # primera vez: ~80MB de modelos ONNX para turn detection
pnpm worker
```

## 3. AllAccess (Vite, puerto 5173)

```bash
cd references/twin-connect-main
cp .env.example .env.local       # ya viene con los valores correctos para localhost
pnpm install --ignore-workspace   # el flag es importante (root tiene workspace yaml)
pnpm dev
```

## Demo flow

1. Browser → `http://localhost:5173`.
2. Click "Ingresar con Twin" → "Autorizar y conectar".
3. Te redirige a `http://localhost:3000/connect?app_id=allaccess_demo&...`.
4. Si no estás logueado en Twin, login con demo1.
5. En el consent screen → "Approve".
6. Volvés a `http://localhost:5173/twin/callback` → tokens guardados, redirige a `/`.
7. **Sección "Para vos"** aparece con eventos rankeados por LLM real (~3-5s loading).
8. Click en un evento → ves el badge "Tu Twin opina" con strong/weak/no_match + reasons.

## Atajos para testear sin browser

```bash
# Smoke con curl (Twin debe estar corriendo)
curl -X POST http://localhost:3000/api/twin/query \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"connection_id":"<CONN_ID>","intent":"general_summary"}'
```

Para conseguir un `connection_id` + `access_token` sin pasar por browser, mirá `tasks/stream-c/C09-query-scaffolding.md` (sección de smoke).

## Estructura

- `src/app/` — Next.js App Router (Twin Protocol web)
- `src/app/api/twin/query/` — el API que consume AllAccess
- `src/app/api/connect/{approve,revoke}/` — OAuth-ish flow
- `src/lib/permissions/` — engine de scopes + blocked domains
- `src/lib/query/intents/` — handlers de cada intent (LLM calls)
- `worker/` — agent LiveKit (Stream B)
- `supabase/migrations/` — schema completo
- `references/twin-connect-main/` — AllAccess (Stream D, integrado con la API real)
  - `src/lib/twin-api.ts` — cliente
  - `src/lib/twin-context.tsx` — provider OAuth-aware
  - `src/routes/twin.callback.tsx` — callback handler

## Tests

```bash
pnpm typecheck   # 0 errors
pnpm vitest run  # 242 tests, 38 archivos
```

# This is an example Dockerfile that builds a minimal container for running LK Agents
# For more information on the build process, see https://docs.livekit.io/agents/ops/deployment/builds/
# syntax=docker/dockerfile:1

# Use the official Node.js v22 base image
# We use the slim variant to keep the image size smaller while still having essential tools
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

# Configure pnpm installation directory and ensure it is on PATH
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# The @huggingface/hub JS lib ignores HF_HOME and always writes to ~/.cache/huggingface.
# We set HOME=/app so `~/.cache` resolves to /app/.cache in BOTH stages: the build
# stage runs as root (default HOME=/root) and would write to /root/.cache; pinning
# HOME=/app means downloads land in /app/.cache, which the COPY --from=build /app
# brings into the runtime stage where appuser also has home=/app.
ENV HOME="/app"

# Install required system packages and pnpm, then clean up the apt cache for a smaller image
# ca-certificates: enables TLS/SSL for securely fetching dependencies and calling HTTPS services
# --no-install-recommends keeps the image minimal
RUN apt-get update -qq && apt-get install --no-install-recommends -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Pin pnpm version for reproducible builds
RUN npm install -g pnpm@10

# --- Build stage ---
# Install dependencies, build the project, and prepare production assets
FROM base AS build

# Create a new directory for our application code
# And set it as the working directory
WORKDIR /app

# Copy just the dependency files first, for more efficient layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies using pnpm
# --frozen-lockfile ensures we use exact versions from pnpm-lock.yaml for reproducible builds
RUN pnpm install --frozen-lockfile

# Copy all remaining application files into the container
# (Excludes files specified in .dockerignore)
COPY . .

# Pre-download ONNX models for turn detector + Silero VAD into the image so
# cold starts don't pay the ~80MB download. Relies on HOME=/app (set in base)
# so saveRevisionMapping writes refs/<tag> inside /app/.cache and survives
# the COPY into the runtime stage.
RUN pnpm tsx worker/index.ts download-files

# --- Production stage ---
FROM base

# Create a non-privileged user that the app will run under
# See https://docs.docker.com/build/building/best-practices/#user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

WORKDIR /app

# Copy the built application with correct ownership in a single layer
# This avoids expensive recursive chown operations on node_modules
COPY --from=build --chown=appuser:appuser /app /app

USER appuser

# Set Node.js to production mode
ENV NODE_ENV=production

# Run the worker. We use tsx directly (not the package.json `worker:start` script,
# which uses --env-file=.env.local; in prod LiveKit Cloud injects secrets as env vars).
CMD [ "pnpm", "tsx", "worker/index.ts", "start" ]

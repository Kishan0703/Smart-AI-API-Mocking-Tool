# syntax=docker/dockerfile:1
#
# MockMaster — production image
#
# Multi-stage build:
#   deps    → installs node_modules (cached unless the lockfile changes)
#   builder → compiles the Next.js "standalone" bundle (output: "standalone")
#   runner  → minimal runtime: no source, no devDependencies, non-root user
#
# Build:  docker build -t mockmaster .
# Run:    docker run -p 3000:3000 mockmaster

ARG NODE_VERSION=24

# ---- Stage 1: dependencies -------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- Stage 2: build ---------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 3: runtime -------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    # Mock endpoint persistence lives in a directory that can be mounted
    # as a volume (docker-compose mounts "mockmaster-data" here).
    MOCK_DATA_DIR=/app/data

# Run as an unprivileged user — a compromised app process gets no root
# rights inside the container.
RUN addgroup -S nodejs && adduser -S nextjs

# Standalone output: server.js + pruned node_modules + the compiled app.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

# Container-level liveness probe used by `docker ps` and orchestrators.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]

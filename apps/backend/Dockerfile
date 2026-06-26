FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

# 1. Prune the workspace for the backend app
FROM base AS builder
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune backend --docker

# 2. Install dependencies and build the isolated workspace
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

# Then copy the source code
COPY --from=builder /app/out/full/ .

# Generate Prisma Client
RUN pnpm --filter backend exec prisma generate

# Build the project
RUN pnpm turbo run build --filter=backend...

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer --chown=nestjs:nodejs /app .

# Set working directory to the backend app
WORKDIR /app/apps/backend

# Expose the port NestJS runs on (typically 3001 in your setup)
EXPOSE 3001

CMD [ "node", "dist/main.js" ]

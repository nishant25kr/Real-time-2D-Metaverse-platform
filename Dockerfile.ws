FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json turbo.json tsconfig.json ./
COPY apps/ws/package.json apps/ws/
COPY packages/db/package.json packages/db/
RUN npm ci

FROM deps AS builder
COPY packages/db packages/db
COPY apps/ws apps/ws
RUN npm run build --workspace=@repo/db && npm run build --workspace=meta-verse-ws

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/generated ./packages/db/generated
COPY --from=builder /app/apps/ws/package.json ./apps/ws/package.json
COPY --from=builder /app/apps/ws/dist ./apps/ws/dist

WORKDIR /app/apps/ws
EXPOSE 8080
CMD ["node", "dist/index.js"]

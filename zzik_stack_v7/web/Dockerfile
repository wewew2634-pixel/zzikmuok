# web/Dockerfile
FROM node:20-bullseye-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/styles ./styles
RUN npm ci --omit=dev && adduser --disabled-password --gecos "" nextjs \
  && chown -R nextjs:nextjs /app
USER nextjs
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]

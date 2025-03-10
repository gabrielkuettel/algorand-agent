FROM node:22.12-alpine AS builder

RUN npm install -g pnpm@latest

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY src ./src

RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:22.12-alpine AS release

RUN npm install -g pnpm@latest

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

ENV NODE_ENV=production

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

ENTRYPOINT ["node", "dist/index.js"] 
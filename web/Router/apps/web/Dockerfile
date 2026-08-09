FROM oven/bun:1.2 AS base
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build
CMD ["bun", "run", "start"]

FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
# COPY package.json bun.lock ./

RUN bun install --production


COPY . .

ENV NODE_ENV=production

RUN bun run build:bun

CMD ["./server"]

EXPOSE 13000

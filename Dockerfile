FROM node:22-bookworm-slim AS web-builder
WORKDIR /app
ARG VITE_API_URL=https://api.memofi.tech
ARG VITE_SITE_URL=https://memofi.tech
ARG VITE_APP_NAME=Memofi
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SITE_URL=${VITE_SITE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/web apps/web
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --dir apps/web build

FROM golang:1.25-bookworm AS api-builder
WORKDIR /app

COPY apps/api/go.mod apps/api/go.sum ./apps/api/
RUN cd apps/api && go mod download
COPY apps/api ./apps/api
RUN cd apps/api && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/brokestack-api ./cmd/server

FROM debian:bookworm-slim AS runtime
ENV DEBIAN_FRONTEND=noninteractive
ENV PGDATA=/var/lib/postgresql/data
LABEL org.opencontainers.image.source="https://github.com/hrmasss/brokestack"
LABEL org.opencontainers.image.description="Memofi production runtime"

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		ca-certificates \
		caddy \
		chromium \
		curl \
		postgresql \
		postgresql-client \
		python3 \
		python3-pip \
		python3-venv \
		redis-server \
		supervisor \
		tzdata \
	&& rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://atlasbinaries.com/atlas/atlas-linux-amd64-latest -o /usr/local/bin/atlas \
	&& chmod +x /usr/local/bin/atlas

WORKDIR /srv/brokestack

COPY --from=web-builder /app/apps/web/dist /srv/brokestack/web/dist
COPY --from=api-builder /out/brokestack-api /usr/local/bin/brokestack-api
COPY apps/worker /srv/brokestack/apps/worker
COPY atlas.hcl /srv/brokestack/atlas.hcl
COPY db/migrations /srv/brokestack/db/migrations
COPY docker/Caddyfile.internal /etc/caddy/Caddyfile
COPY docker/supervisord.conf /etc/supervisor/conf.d/brokestack.conf
COPY docker/brokestack-entrypoint.sh /usr/local/bin/brokestack-entrypoint
COPY docker/start-postgres.sh /usr/local/bin/start-postgres
COPY docker/start-redis.sh /usr/local/bin/start-redis
COPY docker/start-api.sh /usr/local/bin/start-api
COPY docker/start-worker.sh /usr/local/bin/start-worker
COPY docker/start-caddy.sh /usr/local/bin/start-caddy

RUN python3 -m venv /opt/brokestack/venv \
	&& /opt/brokestack/venv/bin/pip install --no-cache-dir --upgrade pip \
	&& /opt/brokestack/venv/bin/pip install --no-cache-dir /srv/brokestack/apps/worker

RUN chmod +x \
	/usr/local/bin/brokestack-entrypoint \
	/usr/local/bin/start-postgres \
	/usr/local/bin/start-redis \
	/usr/local/bin/start-api \
	/usr/local/bin/start-worker \
	/usr/local/bin/start-caddy

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=5 \
	CMD ["/usr/local/bin/brokestack-api", "healthcheck"]

ENTRYPOINT ["/usr/local/bin/brokestack-entrypoint"]
CMD ["serve"]

#!/usr/bin/env bash
set -euo pipefail

REDIS_DATA_DIR="${REDIS_DATA_DIR:-/var/lib/redis}"
mkdir -p "$REDIS_DATA_DIR"
chown -R redis:redis "$REDIS_DATA_DIR"

exec su -s /bin/sh redis -c "redis-server --appendonly yes --dir '$REDIS_DATA_DIR' --bind 127.0.0.1 --port 6379"

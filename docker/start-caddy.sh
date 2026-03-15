#!/usr/bin/env bash
set -euo pipefail

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile

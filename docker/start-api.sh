#!/usr/bin/env bash
set -euo pipefail

for _ in $(seq 1 30); do
	if pg_isready -h 127.0.0.1 -p 5432 -U "${DB_USER:-postgres}" >/dev/null 2>&1; then
		break
	fi
	sleep 1
done

exec /usr/local/bin/brokestack-api serve

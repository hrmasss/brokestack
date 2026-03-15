#!/usr/bin/env bash
set -euo pipefail

export PATH="/opt/brokestack/venv/bin:$PATH"

for _ in $(seq 1 30); do
	if curl -fsS http://127.0.0.1:8080/api/v1/health >/dev/null 2>&1; then
		break
	fi
	sleep 1
done

cd /srv/brokestack
exec uvicorn brokestack_worker.main:app --host 127.0.0.1 --port 8091

#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/opt/brokestack"
COMPOSE_FILE="$APP_ROOT/docker-compose.prod.yml"
ENV_FILE="$APP_ROOT/.env"
CURRENT_IMAGE_FILE="$APP_ROOT/current-image"
PREVIOUS_IMAGE_FILE="$APP_ROOT/previous-image"
CURRENT_BACKUP_FILE="$APP_ROOT/current-backup"
PREVIOUS_BACKUP_FILE="$APP_ROOT/previous-backup"
NEW_IMAGE="${1:?usage: deploy-production.sh <image>}"
TIMESTAMP="$(date -u +%Y%m%d%H%M%S)"
PREDEPLOY_BACKUP="$APP_ROOT/backups/predeploy-$TIMESTAMP.sql"
POSTDEPLOY_BACKUP="$APP_ROOT/backups/current-$TIMESTAMP.sql"

require_env() {
	local name="$1"
	if [[ -z "${!name:-}" ]]; then
		echo "Missing required environment variable: $name" >&2
		exit 1
	fi
}

ensure_paths() {
	mkdir -p \
		"$APP_ROOT" \
		"$APP_ROOT/backups" \
		"$APP_ROOT/data/postgres" \
		"$APP_ROOT/data/redis" \
		"$APP_ROOT/data/browser-state" \
		"$APP_ROOT/data/outputs" \
		/etc/caddy/conf.d
	chmod 700 "$APP_ROOT"
}

write_env_file() {
	printf '%s' "$PROD_ENV_FILE_B64" | base64 -d >"$ENV_FILE"
	chmod 600 "$ENV_FILE"
}

ensure_host_caddy() {
	if ! grep -q 'import /etc/caddy/conf.d/\*.caddy' /etc/caddy/Caddyfile; then
		printf '\nimport /etc/caddy/conf.d/*.caddy\n' >>/etc/caddy/Caddyfile
	fi

	cat >/etc/caddy/conf.d/brokestack.caddy <<'EOF'
memofi.tech, www.memofi.tech, app.memofi.tech, api.memofi.tech {
	reverse_proxy 127.0.0.1:18081
}
EOF

	systemctl reload caddy
}

docker_compose() {
	BROKESTACK_IMAGE="$BROKESTACK_IMAGE" docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

wait_for_health() {
	local attempts=45
	for _ in $(seq 1 "$attempts"); do
		if curl -fsS -H "Host: api.memofi.tech" http://127.0.0.1:18081/api/v1/health | grep -q '"status":"healthy"' &&
			curl -fsS -H "Host: app.memofi.tech" http://127.0.0.1:18081/worker/health | grep -q '"status":"healthy"' &&
			curl -fsS -I -H "Host: app.memofi.tech" http://127.0.0.1:18081/login | grep -q '200'
		then
			return 0
		fi
		sleep 2
	done
	return 1
}

prune_images() {
	local repo="${NEW_IMAGE%%:*}"
	local keep_current="${NEW_IMAGE}"
	local keep_previous="${ROLLBACK_IMAGE:-}"

	while IFS= read -r image; do
		[[ -z "$image" ]] && continue
		[[ "$image" == "$keep_current" ]] && continue
		[[ -n "$keep_previous" && "$image" == "$keep_previous" ]] && continue
		docker image rm -f "$image" >/dev/null 2>&1 || true
	done < <(docker images "$repo" --format '{{.Repository}}:{{.Tag}}' | sort -u)
}

prune_backups() {
	local keep_current=""
	local keep_previous=""
	if [[ -f "$CURRENT_BACKUP_FILE" ]]; then
		keep_current="$(tr -d '\r\n' <"$CURRENT_BACKUP_FILE")"
	fi
	if [[ -f "$PREVIOUS_BACKUP_FILE" ]]; then
		keep_previous="$(tr -d '\r\n' <"$PREVIOUS_BACKUP_FILE")"
	fi

	while IFS= read -r backup; do
		[[ -z "$backup" ]] && continue
		[[ "$backup" == "$keep_current" ]] && continue
		[[ "$backup" == "$keep_previous" ]] && continue
		rm -f "$backup"
	done < <(find "$APP_ROOT/backups" -maxdepth 1 -type f -name '*.sql' | sort)
}

rollback() {
	echo "Deployment failed. Attempting rollback."

	if [[ -n "${ROLLBACK_IMAGE:-}" ]]; then
		BROKESTACK_IMAGE="$ROLLBACK_IMAGE"
		export BROKESTACK_IMAGE
		docker pull "$BROKESTACK_IMAGE" >/dev/null 2>&1 || true
	fi

	docker_compose down || true

	if [[ -f "$PREDEPLOY_BACKUP" ]]; then
		echo "Restoring database from $PREDEPLOY_BACKUP"
		docker_compose run --rm app restore-db "$PREDEPLOY_BACKUP" || true
	fi

	if [[ -n "${ROLLBACK_IMAGE:-}" ]]; then
		echo "Restarting previous image $ROLLBACK_IMAGE"
		docker_compose up -d || true
		printf '%s\n' "$ROLLBACK_IMAGE" >"$CURRENT_IMAGE_FILE"
	fi
}

main() {
	require_env PROD_ENV_FILE_B64
	require_env GHCR_USERNAME
	require_env GHCR_TOKEN

	ensure_paths
	write_env_file
	ensure_host_caddy

	ROLLBACK_IMAGE=""
	if [[ -f "$CURRENT_IMAGE_FILE" ]]; then
		ROLLBACK_IMAGE="$(tr -d '\r\n' <"$CURRENT_IMAGE_FILE")"
	fi

	echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin >/dev/null

	if [[ -f "$APP_ROOT/data/postgres/PG_VERSION" ]]; then
		BROKESTACK_IMAGE="${ROLLBACK_IMAGE:-$NEW_IMAGE}"
		export BROKESTACK_IMAGE
		docker pull "$BROKESTACK_IMAGE" >/dev/null 2>&1 || true
		docker_compose down || true
		docker_compose run --rm app backup-db "$PREDEPLOY_BACKUP"
	fi

	BROKESTACK_IMAGE="$NEW_IMAGE"
	export BROKESTACK_IMAGE
	trap rollback ERR

	docker pull "$BROKESTACK_IMAGE"
	docker_compose down || true
	docker_compose run --rm app migrate
	docker_compose run --rm app seed-system
	docker_compose up -d
	wait_for_health
	docker_compose exec -T app /usr/local/bin/brokestack-api backup-db "$POSTDEPLOY_BACKUP"

	if [[ -n "${ROLLBACK_IMAGE:-}" ]]; then
		printf '%s\n' "$ROLLBACK_IMAGE" >"$PREVIOUS_IMAGE_FILE"
	fi
	printf '%s\n' "$BROKESTACK_IMAGE" >"$CURRENT_IMAGE_FILE"

	if [[ -f "$PREDEPLOY_BACKUP" ]]; then
		printf '%s\n' "$PREDEPLOY_BACKUP" >"$PREVIOUS_BACKUP_FILE"
	fi
	printf '%s\n' "$POSTDEPLOY_BACKUP" >"$CURRENT_BACKUP_FILE"

	trap - ERR
	prune_images
	prune_backups
}

main "$@"

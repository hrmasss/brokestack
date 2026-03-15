#!/usr/bin/env bash
set -euo pipefail

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
REDIS_DATA_DIR="${REDIS_DATA_DIR:-/var/lib/redis}"

pg_bin() {
	local binary="$1"
	if command -v "$binary" >/dev/null 2>&1; then
		command -v "$binary"
		return
	fi

	local candidate
	for candidate in /usr/lib/postgresql/*/bin/"$binary"; do
		if [[ -x "$candidate" ]]; then
			printf '%s\n' "$candidate"
			return
		fi
	done

	echo "Unable to find PostgreSQL binary: $binary" >&2
	exit 1
}

ensure_dirs() {
	mkdir -p "$PGDATA" "$REDIS_DATA_DIR" /run/postgresql /srv/brokestack/storage/browser-state /srv/brokestack/storage/outputs /opt/brokestack/backups
	chown -R postgres:postgres "$PGDATA" /run/postgresql
	chown -R redis:redis "$REDIS_DATA_DIR"
	chmod 775 /run/postgresql
}

parse_database_url() {
	local url="${DATABASE_URL:-}"
	if [[ -z "$url" ]]; then
		echo "DATABASE_URL is required" >&2
		exit 1
	fi

	local without_scheme="${url#postgres://}"
	without_scheme="${without_scheme#postgresql://}"
	local authority="${without_scheme%%/*}"
	local credentials=""
	if [[ "$authority" == *"@"* ]]; then
		credentials="${authority%@*}"
	fi

	DB_USER="${credentials%%:*}"
	if [[ -z "$DB_USER" ]]; then
		DB_USER="postgres"
	fi

	DB_NAME="${without_scheme#*/}"
	DB_NAME="${DB_NAME%%\?*}"
	DB_NAME="${DB_NAME%%#*}"
	export DB_USER DB_NAME
}

init_postgres_cluster() {
	local initdb_bin
	initdb_bin="$(pg_bin initdb)"

	if [[ -s "$PGDATA/PG_VERSION" ]]; then
		return
	fi

	su -s /bin/sh postgres -c "'$initdb_bin' -D '$PGDATA' --username=postgres --auth=trust --encoding=UTF8 --locale=C.UTF-8"
	cat >>"$PGDATA/postgresql.conf" <<'EOF'
listen_addresses = '127.0.0.1'
port = 5432
unix_socket_directories = '/run/postgresql'
EOF
	cat >"$PGDATA/pg_hba.conf" <<'EOF'
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
EOF
}

ensure_role_and_database() {
	local psql_bin
	local createdb_bin
	psql_bin="$(pg_bin psql)"
	createdb_bin="$(pg_bin createdb)"

	if [[ "${DB_USER}" != "postgres" ]]; then
		local role_exists
		role_exists="$("$psql_bin" -h 127.0.0.1 -U postgres -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'")"
		if [[ "$role_exists" != "1" ]]; then
			"$psql_bin" -h 127.0.0.1 -U postgres -d postgres -v ON_ERROR_STOP=1 \
				-c "CREATE ROLE \"$DB_USER\" WITH LOGIN;"
		fi
	fi

	local database_exists
	database_exists="$("$psql_bin" -h 127.0.0.1 -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'")"
	if [[ "$database_exists" != "1" ]]; then
		"$createdb_bin" -h 127.0.0.1 -U postgres -O "$DB_USER" -T template0 -E UTF8 "$DB_NAME"
		return
	fi

	"$psql_bin" -h 127.0.0.1 -U postgres -d postgres -v ON_ERROR_STOP=1 \
		-c "ALTER DATABASE \"$DB_NAME\" OWNER TO \"$DB_USER\";"
	"$psql_bin" -h 127.0.0.1 -U postgres -d "$DB_NAME" -v ON_ERROR_STOP=1 <<EOF
ALTER SCHEMA public OWNER TO "$DB_USER";
GRANT ALL ON SCHEMA public TO "$DB_USER";
GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
EOF
}

start_temp_postgres() {
	local pg_ctl_bin
	pg_ctl_bin="$(pg_bin pg_ctl)"
	su -s /bin/sh postgres -c "'$pg_ctl_bin' -D '$PGDATA' -w start" >/dev/null
}

stop_temp_postgres() {
	local pg_ctl_bin
	pg_ctl_bin="$(pg_bin pg_ctl)"
	su -s /bin/sh postgres -c "'$pg_ctl_bin' -D '$PGDATA' -m fast -w stop" >/dev/null
}

run_one_shot() {
	local command="$1"
	shift

	ensure_dirs
	parse_database_url
	init_postgres_cluster
	start_temp_postgres
	trap stop_temp_postgres EXIT
	ensure_role_and_database
	cd /srv/brokestack
	/usr/local/bin/brokestack-api "$command" "$@"
}

main() {
	local command="${1:-serve}"
	case "$command" in
		serve)
			shift || true
			ensure_dirs
			parse_database_url
			init_postgres_cluster
			exec /usr/bin/supervisord -c /etc/supervisor/conf.d/brokestack.conf
			;;
		migrate|seed-system|backup-db|restore-db)
			shift || true
			run_one_shot "$command" "$@"
			;;
		healthcheck)
			shift || true
			exec /usr/local/bin/brokestack-api healthcheck "$@"
			;;
		*)
			exec "$@"
			;;
	esac
}

main "$@"

#!/usr/bin/env bash
set -euo pipefail

PGDATA="${PGDATA:-/var/lib/postgresql/data}"

pg_postgres_bin() {
	if command -v postgres >/dev/null 2>&1; then
		command -v postgres
		return
	fi

	local candidate
	for candidate in /usr/lib/postgresql/*/bin/postgres; do
		if [[ -x "$candidate" ]]; then
			printf '%s\n' "$candidate"
			return
		fi
	done

	echo "Unable to find PostgreSQL server binary." >&2
	exit 1
}

mkdir -p /run/postgresql
chown -R postgres:postgres "$PGDATA" /run/postgresql
chmod 775 /run/postgresql

POSTGRES_BIN="$(pg_postgres_bin)"
exec su -s /bin/sh postgres -c "'$POSTGRES_BIN' -D '$PGDATA'"

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env");

function readEnvFile(filePath) {
	if (!existsSync(filePath)) {
		return {};
	}

	const values = {};
	for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}
		const separatorIndex = trimmed.indexOf("=");
		if (separatorIndex <= 0) {
			continue;
		}
		const key = trimmed.slice(0, separatorIndex).trim();
		const value = trimmed.slice(separatorIndex + 1).trim();
		values[key] = value;
	}
	return values;
}

const env = {
	...readEnvFile(envPath),
	...process.env,
};

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
	console.error("DATABASE_URL is required to prepare the E2E database.");
	process.exit(1);
}

const migrationPath = path.join(rootDir, "db", "migrations", "20260316010000_images_api.sql");
const checkSql = "SELECT to_regclass('public.image_jobs');";

const checkOutput = execFileSync("psql", [databaseUrl, "-t", "-A", "-c", checkSql], {
	encoding: "utf8",
	stdio: ["ignore", "pipe", "inherit"],
});

if (checkOutput.trim() === "image_jobs") {
	console.log("[e2e-db] image_jobs already exists, skipping migration.");
	process.exit(0);
}

console.log("[e2e-db] applying image/API migration for browser tests.");
execFileSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", migrationPath], {
	stdio: "inherit",
});

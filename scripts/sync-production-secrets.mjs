#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const envFile = process.argv[2]
	? path.resolve(process.argv[2])
	: path.resolve(process.cwd(), ".env.production");

if (!existsSync(envFile)) {
	console.error(`Missing env file: ${envFile}`);
	process.exit(1);
}

execFileSync("gh", ["auth", "token"], { stdio: ["ignore", "ignore", "inherit"] });

const dotenvRaw = readFileSync(envFile, "utf8");
const envMap = parseDotenv(dotenvRaw);
const runtimeEnvRaw = buildRuntimeEnv(dotenvRaw);

const requiredKeys = [
	"DEPLOY_SSH_HOST",
	"DEPLOY_SSH_USER",
	"DEPLOY_SSH_PORT",
	"DEPLOY_SSH_KEY_PATH",
	"DEPLOY_GHCR_USERNAME",
	"DEPLOY_GHCR_TOKEN",
	"DEPLOY_DISCORD_WEBHOOK_URL",
];

for (const key of requiredKeys) {
	if (!envMap.get(key)) {
		console.error(`Missing required key in ${envFile}: ${key}`);
		process.exit(1);
	}
}

const sshKeyPath = expandHome(envMap.get("DEPLOY_SSH_KEY_PATH"));
if (!existsSync(sshKeyPath)) {
	console.error(`SSH key path not found: ${sshKeyPath}`);
	process.exit(1);
}

const secretEntries = new Map([
	["PROD_ENV_FILE_B64", Buffer.from(runtimeEnvRaw, "utf8").toString("base64")],
	["PROD_SSH_HOST", envMap.get("DEPLOY_SSH_HOST")],
	["PROD_SSH_USER", envMap.get("DEPLOY_SSH_USER")],
	["PROD_SSH_PORT", envMap.get("DEPLOY_SSH_PORT")],
	["PROD_SSH_KEY", readFileSync(sshKeyPath, "utf8")],
	["PROD_GHCR_USERNAME", envMap.get("DEPLOY_GHCR_USERNAME")],
	["PROD_GHCR_TOKEN", envMap.get("DEPLOY_GHCR_TOKEN")],
	["PROD_DISCORD_WEBHOOK_URL", envMap.get("DEPLOY_DISCORD_WEBHOOK_URL")],
]);

for (const [name, value] of secretEntries) {
	console.log(`Setting production secret ${name}`);
	execFileSync("gh", ["secret", "set", "--env", "production", name], {
		input: value,
		stdio: ["pipe", "inherit", "inherit"],
	});
}

console.log("Production secrets synced.");

function parseDotenv(contents) {
	const map = new Map();
	for (const rawLine of contents.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) {
			continue;
		}
		const separatorIndex = line.indexOf("=");
		if (separatorIndex === -1) {
			continue;
		}
		const key = line.slice(0, separatorIndex).trim();
		let value = line.slice(separatorIndex + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		map.set(key, value);
	}
	return map;
}

function expandHome(value) {
	if (!value) {
		return value;
	}
	if (value.startsWith("~/") || value.startsWith("~\\")) {
		return path.join(process.env.USERPROFILE || process.env.HOME || "", value.slice(2));
	}
	return path.resolve(value);
}

function buildRuntimeEnv(contents) {
	return contents
		.split(/\r?\n/)
		.filter((line) => {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) {
				return true;
			}
			return !trimmed.startsWith("DEPLOY_");
		})
		.join("\n");
}

import { execSync } from "node:child_process";

function unique(values) {
	return [...new Set(values)];
}

function listPidsOnWindows(port) {
	const output = execSync(`netstat -ano -p tcp`, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
	});

	const pids = [];
	for (const line of output.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || !trimmed.includes("LISTENING")) {
			continue;
		}
		const columns = trimmed.split(/\s+/);
		if (columns.length < 5) {
			continue;
		}
		const localAddress = columns[1];
		const pid = columns.at(-1);
		if (localAddress.endsWith(`:${port}`) && pid && /^\d+$/.test(pid)) {
			pids.push(pid);
		}
	}
	return unique(pids);
}

function listPidsOnUnix(port) {
	try {
		const output = execSync(`lsof -ti tcp:${port}`, {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
		return unique(
			output
				.split(/\r?\n/)
				.map((value) => value.trim())
				.filter((value) => /^\d+$/.test(value)),
		);
	} catch {
		return [];
	}
}

function killPid(pid) {
	if (process.platform === "win32") {
		execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
		return;
	}
	process.kill(Number(pid), "SIGTERM");
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function freePort(port) {
	const pids =
		process.platform === "win32"
			? listPidsOnWindows(port)
			: listPidsOnUnix(port);

	if (!pids.length) {
		return;
	}

	console.log(`[dev] clearing port ${port} from PID${pids.length > 1 ? "s" : ""}: ${pids.join(", ")}`);
	for (const pid of pids) {
		try {
			killPid(pid);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`[dev] failed to stop PID ${pid} on port ${port}: ${message}`);
		}
	}

	if (process.platform === "win32") {
		await sleep(500);
	}
}

const ports = process.argv.slice(2).map((value) => Number(value)).filter(Number.isInteger);

if (!ports.length) {
	console.error("Usage: node scripts/free-dev-ports.mjs <port> [port...]");
	process.exit(1);
}

for (const port of ports) {
	await freePort(port);
}

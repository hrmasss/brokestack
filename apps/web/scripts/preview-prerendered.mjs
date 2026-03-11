import { createReadStream, existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist");
const args = process.argv.slice(2);

function readArg(name, fallback) {
	const index = args.indexOf(name);
	if (index === -1) {
		return fallback;
	}

	return args[index + 1] ?? fallback;
}

const host = readArg("--host", "127.0.0.1");
const port = Number.parseInt(readArg("--port", "4173"), 10);

const contentTypes = {
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".ico": "image/x-icon",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".svg": "image/svg+xml",
	".txt": "text/plain; charset=utf-8",
	".woff2": "font/woff2",
	".xml": "application/xml; charset=utf-8",
};

function getContentType(filePath) {
	return contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function safeJoin(...segments) {
	const candidate = path.resolve(distDir, ...segments);
	if (!candidate.startsWith(distDir)) {
		return null;
	}

	return candidate;
}

function resolveRequestPath(pathname) {
	const normalized = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

	if (normalized === "/") {
		return safeJoin("index.html");
	}

	const directFile = safeJoin(normalized.slice(1));
	if (directFile && existsSync(directFile) && statSync(directFile).isFile()) {
		return directFile;
	}

	const prerenderedPage = safeJoin(normalized.slice(1), "index.html");
	if (
		prerenderedPage &&
		existsSync(prerenderedPage) &&
		statSync(prerenderedPage).isFile()
	) {
		return prerenderedPage;
	}

	if (path.extname(normalized)) {
		return null;
	}

	return safeJoin("index.html");
}

const server = http.createServer(async (request, response) => {
	const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
	const filePath = resolveRequestPath(decodeURIComponent(requestUrl.pathname));

	if (!filePath) {
		response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
		response.end("Not found");
		return;
	}

	try {
		if (request.method === "HEAD") {
			const stats = statSync(filePath);
			response.writeHead(200, {
				"Content-Length": stats.size,
				"Content-Type": getContentType(filePath),
			});
			response.end();
			return;
		}

		if (getContentType(filePath).startsWith("text/") || filePath.endsWith(".xml")) {
			const file = await readFile(filePath);
			response.writeHead(200, {
				"Content-Length": file.length,
				"Content-Type": getContentType(filePath),
			});
			response.end(file);
			return;
		}

		const stats = statSync(filePath);
		response.writeHead(200, {
			"Content-Length": stats.size,
			"Content-Type": getContentType(filePath),
		});
		createReadStream(filePath).pipe(response);
	} catch {
		response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		response.end("Unable to serve preview asset");
	}
});

server.listen(port, host, () => {
	console.log(`Preview server running at http://${host}:${port}`);
});

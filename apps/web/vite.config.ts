import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

function resolveDevApiTarget(value?: string) {
	const fallbackTarget = "http://127.0.0.1:8080";
	if (!value) {
		return fallbackTarget;
	}

	// Vite's proxy can resolve localhost to IPv6 on Windows while the Go API
	// is bound to 127.0.0.1. Normalize localhost to IPv4 for dev stability.
	return value.replace("://localhost", "://127.0.0.1");
}

export default defineConfig(({ mode, isSsrBuild }) => {
	// Load env from root directory
	const env = loadEnv(mode, path.resolve(__dirname, "../.."), "");
	const apiProxyTarget = resolveDevApiTarget(env.VITE_API_URL);

	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		server: {
			port: 5173,
			proxy: {
				"/api": {
					target: apiProxyTarget,
					changeOrigin: true,
				},
			},
		},
		envDir: path.resolve(__dirname, "../.."),
		build: {
			emptyOutDir: !isSsrBuild,
		},
		define: {
			"import.meta.env.VITE_APP_NAME": JSON.stringify(
				env.VITE_APP_NAME || "Memofi",
			),
		},
	};
});

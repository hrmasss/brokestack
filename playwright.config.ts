import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./apps/web/e2e",
	timeout: 120_000,
	expect: {
		timeout: 15_000,
	},
	use: {
		baseURL: "http://127.0.0.1:4173",
		trace: "retain-on-failure",
	},
	webServer: [
		{
			command: "pnpm run dev:api:e2e",
			url: "http://127.0.0.1:8180/api/v1/health",
			reuseExistingServer: false,
			timeout: 120_000,
			env: {
				...process.env,
				API_HOST: "127.0.0.1",
				API_PORT: "8180",
				API_ALLOWED_ORIGINS: "http://127.0.0.1:4173",
				WORKER_URL: "http://127.0.0.1:8191",
			},
		},
		{
			command: "pnpm --dir apps/web dev --host 127.0.0.1 --port 4173",
			url: "http://127.0.0.1:4173",
			reuseExistingServer: false,
			timeout: 120_000,
			env: {
				...process.env,
				VITE_API_URL: "http://127.0.0.1:8180",
				VITE_SITE_URL: "http://127.0.0.1:4173",
			},
		},
		{
			command: "cd apps/worker && uv run uvicorn brokestack_worker.main:app --reload --host 127.0.0.1 --port 8191",
			url: "http://127.0.0.1:8191/health",
			reuseExistingServer: false,
			timeout: 120_000,
			env: {
				...process.env,
				WORKER_TEST_MODE: "true",
				WORKER_CHROME_HEADLESS: "true",
				WORKER_API_BASE_URL: "http://127.0.0.1:8180",
				WORKER_PUBLIC_BASE_URL: "http://127.0.0.1:8191",
			},
		},
	],
});

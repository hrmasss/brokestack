import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const apiBaseUrl = "http://127.0.0.1:8180";

type AuthState = {
	token: string;
	workspaceId: string;
};

type ProviderFixture = {
	account: {
		id: string;
		label: string;
	};
	loginSession?: {
		id: string;
		providerAccountId: string;
		streamUrl: string;
	};
};

async function signUp(page: Page, slug: string) {
	const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
	await page.goto("/signup");
	await page.locator("#signup-name").fill("E2E Operator");
	await page.locator("#signup-workspace").fill(`E2E Workspace ${slug}`);
	await page.locator("#signup-email").fill(`e2e-${slug}-${suffix}@example.com`);
	await page.locator("#signup-password").fill("Password123!");
	await page.locator("#signup-confirm-password").fill("Password123!");
	await page.getByRole("button", { name: "Create account" }).click();
	await expect(page).toHaveURL(/\/dashboard/);
}

async function readAuthState(page: Page): Promise<AuthState> {
	const state = await page.evaluate(() => ({
		token: window.localStorage.getItem("brokestack:customer-access-token") ?? "",
		workspaceId: window.localStorage.getItem("brokestack:active-workspace-id") ?? "",
	}));
	expect(state.token).not.toBe("");
	expect(state.workspaceId).not.toBe("");
	return state;
}

async function createProviderFixture(
	page: Page,
	request: APIRequestContext,
	options: { includeLoginSession?: boolean; label?: string } = {},
) {
	const auth = await readAuthState(page);
	const response = await request.post(
		`${apiBaseUrl}/api/v1/dev/e2e/workspaces/${auth.workspaceId}/provider-fixture`,
		{
			headers: {
				Authorization: `Bearer ${auth.token}`,
			},
			data: {
				label: options.label ?? "E2E ChatGPT",
				includeLoginSession: options.includeLoginSession ?? false,
			},
		},
	);
	expect(response.ok()).toBeTruthy();
	return {
		auth,
		fixture: (await response.json()) as ProviderFixture,
	};
}

test("images empty state and legacy route redirect work", async ({ page }) => {
	await signUp(page, "empty");

	await page.goto("/dashboard/images");
	await expect(page.getByText("Connect a provider to start generating images")).toBeVisible();
	await expect(page.getByRole("button", { name: "Connect account" }).first()).toBeVisible();

	await page.goto("/dashboard/automations");
	await expect(page).toHaveURL(/\/dashboard\/images$/);
});

test("connections page renders the dedicated browser shell", async ({ page, request }) => {
	await signUp(page, "connections");
	const { auth, fixture } = await createProviderFixture(page, request, {
		includeLoginSession: true,
		label: "Browser Fixture",
	});

	await page.evaluate(
		({ workspaceId, session }) => {
			window.localStorage.setItem(
				`brokestack:login-session:${workspaceId}`,
				JSON.stringify(session),
			);
		},
		{ workspaceId: auth.workspaceId, session: fixture.loginSession },
	);

	await page.goto("/dashboard/images/connections");
	await page.getByRole("button", { name: "Resume browser" }).click();
	await expect(page.getByText("Embedded browser connection")).toBeVisible();
	await expect(page.locator('iframe[title="Remote browser session"]')).toBeVisible();
	await expect(page.getByText("Browser Fixture")).toBeVisible();
});

test("single and batch image flows share the image library and detail page", async ({
	page,
	request,
}) => {
	await signUp(page, "images");
	await createProviderFixture(page, request, { label: "Generation Fixture" });

	await page.goto("/dashboard/images/new");
	await page.getByLabel("Title").fill("Marketing hero");
	await page.getByLabel("Aspect ratio").selectOption("1:1");
	await page.getByLabel("Prompt").fill(
		"Create a polished product campaign image with warm studio light.",
	);
	await page.getByRole("button", { name: "Queue image" }).click();

	await expect(page).toHaveURL(/\/dashboard\/images\/.+/);
	await expect(page.getByRole("heading", { name: "Outputs", exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: "Open" })).toBeVisible({ timeout: 30_000 });
	await expect(page.getByRole("button", { name: "Download" })).toBeVisible({
		timeout: 30_000,
	});

	await page.goto("/dashboard/images/batch");
	await page.getByLabel("Batch title").fill("Launch sweep");
	await page.getByLabel("Placeholder variable").fill("item");
	await page.getByLabel("Prompt template").fill(
		"Generate a campaign visual for {{item}} with dramatic lighting.",
	);
	await page.getByLabel("Placeholder values").fill("spring collection\nholiday launch");
	await page.getByRole("button", { name: "Queue batch" }).click();

	await expect(page).toHaveURL(/\/dashboard\/images\/.+/);

	await page.goto("/dashboard/images");
	await expect(page.getByText("Marketing hero")).toBeVisible();
	await expect(page.getByText("Launch sweep · spring collection")).toBeVisible();
	await expect(page.getByText("Launch sweep · holiday launch")).toBeVisible();
	await page.getByRole("button", { name: "Grid" }).click();
	await expect(page.getByRole("button", { name: "View details" }).first()).toBeVisible();
	await page.getByRole("button", { name: "List" }).click();
	await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
});

test("api page can create keys, open docs, submit api jobs, reveal secrets, and revoke keys", async ({
	page,
	request,
}) => {
	await signUp(page, "api");
	await createProviderFixture(page, request, { label: "API Fixture" });

	await page.goto("/dashboard/api");
	await page.getByRole("button", { name: "Generate API key" }).click();
	await page.getByLabel("Key name").fill("Playwright API Key");
	await page.getByLabel("Requests per minute").fill("30");
	await page.getByLabel("Daily image quota").fill("100");
	await page.getByRole("button", { name: "Create key" }).click();

	await expect(page.getByText("Key created")).toBeVisible();
	const secret = (await page.locator("code").first().innerText()).trim();
	expect(secret).toContain("bsk_live_");

	const apiResponse = await request.post(`${apiBaseUrl}/api/v1/images`, {
		headers: {
			Authorization: `Bearer ${secret}`,
		},
		data: {
			title: "API generated hero",
			promptText: "Create an API generated launch image with crisp contrast.",
			aspectRatio: "16:9",
		},
	});
	expect(apiResponse.ok()).toBeTruthy();

	const docsPage = await page.context().newPage();
	await docsPage.goto("/dashboard/api/docs");
	await expect(docsPage.getByRole("heading", { name: "API docs", exact: true })).toBeVisible();
	await expect(docsPage.locator('iframe[title="BrokeStack API reference"]')).toBeVisible();
	await docsPage.close();

	await page.getByRole("button", { name: "Grid" }).click();
	await page.getByRole("button", { name: "Reveal secret" }).click();
	await expect(page.locator("code").first()).toContainText(secret);

	await page.getByRole("button", { name: "List" }).click();
	await page.locator("table tbody tr").first().getByRole("button").click();
	await page.getByRole("menuitem", { name: "Revoke" }).click();
	await expect(page.getByText("revoked")).toBeVisible();

	await page.getByRole("link", { name: "Images" }).click();
	await expect(page).toHaveURL(/\/dashboard\/images$/);
	await expect(page.getByText("API generated hero")).toBeVisible();
	await expect(page.getByText("api", { exact: true }).first()).toBeVisible();
});

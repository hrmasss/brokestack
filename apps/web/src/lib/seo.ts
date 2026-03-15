export const SITE_NAME = "BrokeStack";
export const SITE_URL =
	import.meta.env.VITE_SITE_URL?.trim() || "https://brokestack.app";
export const SITE_IMAGE = `${SITE_URL}/branding/heimdall-icon-512.png`;

export type RouteSeo = {
	title: string;
	description: string;
	path: string;
	keywords: string[];
	ogType?: "website" | "article";
	themeColor?: string;
	structuredData?: Record<string, unknown>[];
};

export const marketingPrerenderRoutes = [
	"/",
	"/features",
	"/pricing",
	"/about",
	"/blog",
] as const;

const defaultThemeColor = "#f3f8f3";

const organizationSchema = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: SITE_NAME,
	url: SITE_URL,
	logo: `${SITE_URL}/branding/heimdall-logo-dark.png`,
	description:
		"BrokeStack is a workspace and API platform for automation, utility tools, scraping flows, and AI-assisted operations.",
};

const softwareSchema = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: SITE_NAME,
	applicationCategory: "BusinessApplication",
	operatingSystem: "Web",
	url: SITE_URL,
	description:
		"BrokeStack helps teams run tools, manage API access, automate workflows, and coordinate execution across shared workspaces.",
};

const marketingRouteSeo = new Map<string, RouteSeo>([
	[
		"/",
		{
			title: "BrokeStack | Automation Tools Workspace and API Platform",
			description:
				"Run tools, trigger automations, manage API access, and coordinate AI-assisted workflows from one multi-tenant workspace.",
			path: "/",
			keywords: [
				"automation tools platform",
				"utility api workspace",
				"scraping workflow software",
				"ai tools dashboard",
				"multi-tenant api platform",
			],
			structuredData: [organizationSchema, softwareSchema],
		},
	],
	[
		"/features",
		{
			title: "BrokeStack Features | Tools, Workspaces, APIs, and Automation",
			description:
				"Explore BrokeStack features for tool runs, shared workspaces, API access, job orchestration, and operator-friendly administration.",
			path: "/features",
			keywords: [
				"automation platform features",
				"tool execution workspace",
				"api access management",
				"job orchestration dashboard",
				"admin workspace software",
			],
			structuredData: [softwareSchema],
		},
	],
	[
		"/pricing",
		{
			title: "BrokeStack Pricing | Free Tier and Affordable Paid Plans",
			description:
				"Compare BrokeStack plans for solo builders, growing teams, and operator-managed organizations using APIs, tools, and automation.",
			path: "/pricing",
			keywords: [
				"automation tools pricing",
				"api platform pricing",
				"ai tools saas plans",
				"workspace automation pricing",
				"developer tool subscription",
			],
			structuredData: [softwareSchema],
		},
	],
	[
		"/about",
		{
			title: "About BrokeStack | Built for Practical Automation",
			description:
				"Learn how BrokeStack is building a practical tool platform for automation, APIs, scraping, and operator-managed execution.",
			path: "/about",
			keywords: [
				"about BrokeStack",
				"automation platform company",
				"tool workspace software",
				"api operations platform",
				"practical ai tools",
			],
			structuredData: [organizationSchema],
		},
	],
	[
		"/blog",
		{
			title: "BrokeStack Blog | Tooling Notes, Product Updates, and Workflow Guides",
			description:
				"Read BrokeStack updates on automation patterns, API products, tool design, execution infrastructure, and product decisions.",
			path: "/blog",
			keywords: [
				"automation engineering blog",
				"api product updates",
				"tooling workflow guides",
				"scraping infrastructure notes",
				"ai automation blog",
			],
			structuredData: [
				{
					"@context": "https://schema.org",
					"@type": "Blog",
					name: "BrokeStack Blog",
					url: `${SITE_URL}/blog`,
					description:
						"Product updates, tooling notes, and practical workflow guides from BrokeStack.",
					publisher: {
						"@type": "Organization",
						name: SITE_NAME,
						url: SITE_URL,
					},
				},
			],
		},
	],
]);

const defaultSeo: RouteSeo = {
	title: "BrokeStack | Automation, APIs, and Shared Tool Workspaces",
	description:
		"BrokeStack gives teams a practical workspace for automation, tool execution, API access, and operator-managed workflows.",
	path: "/",
	keywords: [
		"automation workspace",
		"api tools platform",
		"shared tool dashboard",
	],
	themeColor: defaultThemeColor,
	ogType: "website",
};

export function normalizeSeoPath(pathname: string) {
	if (!pathname || pathname === "/") {
		return "/";
	}

	const normalized = pathname.split("?")[0]?.split("#")[0] ?? "/";
	return normalized.endsWith("/") ? normalized.slice(0, -1) || "/" : normalized;
}

export function getSeoForPath(pathname: string): RouteSeo {
	const normalizedPath = normalizeSeoPath(pathname);
	const routeSeo = marketingRouteSeo.get(normalizedPath);

	if (!routeSeo) {
		return defaultSeo;
	}

	return {
		...routeSeo,
		ogType: routeSeo.ogType ?? "website",
		themeColor: routeSeo.themeColor ?? defaultThemeColor,
	};
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
	if (typeof document === "undefined") {
		return;
	}

	let element = document.head.querySelector<HTMLMetaElement>(selector);
	if (!element) {
		element = document.createElement("meta");
		document.head.appendChild(element);
	}

	for (const [name, value] of Object.entries(attributes)) {
		element.setAttribute(name, value);
	}
}

function upsertLink(selector: string, attributes: Record<string, string>) {
	if (typeof document === "undefined") {
		return;
	}

	let element = document.head.querySelector<HTMLLinkElement>(selector);
	if (!element) {
		element = document.createElement("link");
		document.head.appendChild(element);
	}

	for (const [name, value] of Object.entries(attributes)) {
		element.setAttribute(name, value);
	}
}

function upsertStructuredData(structuredData: Record<string, unknown>[]) {
	if (typeof document === "undefined") {
		return;
	}

	const existingNodes = document.head.querySelectorAll(
		'script[data-brokestack-seo="structured-data"]',
	);
	for (const node of existingNodes) {
		node.remove();
	}

	for (const item of structuredData) {
		const script = document.createElement("script");
		script.type = "application/ld+json";
		script.dataset.brokestackSeo = "structured-data";
		script.text = JSON.stringify(item);
		document.head.appendChild(script);
	}
}

export function applyDocumentSeo(seo: RouteSeo) {
	if (typeof document === "undefined") {
		return;
	}

	document.title = seo.title;

	upsertMeta('meta[name="description"]', {
		name: "description",
		content: seo.description,
	});
	upsertMeta('meta[name="keywords"]', {
		name: "keywords",
		content: seo.keywords.join(", "),
	});
	upsertMeta('meta[name="robots"]', {
		name: "robots",
		content: "index, follow",
	});
	upsertMeta('meta[name="theme-color"]', {
		name: "theme-color",
		content: seo.themeColor ?? defaultThemeColor,
	});
	upsertMeta('meta[property="og:title"]', {
		property: "og:title",
		content: seo.title,
	});
	upsertMeta('meta[property="og:description"]', {
		property: "og:description",
		content: seo.description,
	});
	upsertMeta('meta[property="og:type"]', {
		property: "og:type",
		content: seo.ogType ?? "website",
	});
	upsertMeta('meta[property="og:url"]', {
		property: "og:url",
		content: `${SITE_URL}${seo.path}`,
	});
	upsertMeta('meta[property="og:image"]', {
		property: "og:image",
		content: SITE_IMAGE,
	});
	upsertMeta('meta[name="twitter:card"]', {
		name: "twitter:card",
		content: "summary_large_image",
	});
	upsertMeta('meta[name="twitter:title"]', {
		name: "twitter:title",
		content: seo.title,
	});
	upsertMeta('meta[name="twitter:description"]', {
		name: "twitter:description",
		content: seo.description,
	});
	upsertMeta('meta[name="twitter:image"]', {
		name: "twitter:image",
		content: SITE_IMAGE,
	});

	upsertLink('link[rel="canonical"]', {
		rel: "canonical",
		href: `${SITE_URL}${seo.path}`,
	});

	upsertStructuredData(seo.structuredData ?? []);
}

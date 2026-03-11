import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distDir = path.resolve(process.cwd(), "dist");
const templatePath = path.join(distDir, "index.html");
const serverEntryPath = path.join(distDir, "server", "entry-server.js");

function escapeHtml(value) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function withReplacedTag(html, pattern, replacement, label) {
	if (!pattern.test(html)) {
		throw new Error(`Unable to replace ${label} in prerender template.`);
	}

	return html.replace(pattern, replacement);
}

function buildHeadTags(seo, siteUrl) {
	const structuredData = seo.structuredData ?? [];
	const canonicalUrl = `${siteUrl}${seo.path}`;

	return [
		`<meta name="keywords" content="${escapeHtml(seo.keywords.join(", "))}" />`,
		'<meta name="robots" content="index, follow" />',
		`<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
		`<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
		`<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
		`<meta property="og:type" content="${escapeHtml(seo.ogType ?? "website")}" />`,
		`<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
		`<meta property="og:image" content="${escapeHtml(`${siteUrl}/branding/heimdall-icon-512.png`)}" />`,
		'<meta name="twitter:card" content="summary_large_image" />',
		`<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
		`<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
		`<meta name="twitter:image" content="${escapeHtml(`${siteUrl}/branding/heimdall-icon-512.png`)}" />`,
		...structuredData.map(
			(item) =>
				`<script type="application/ld+json">${JSON.stringify(item)}</script>`,
		),
	].join("\n    ");
}

function getOutputPath(routePath) {
	if (routePath === "/") {
		return path.join(distDir, "index.html");
	}

	return path.join(distDir, routePath.slice(1), "index.html");
}

const template = await readFile(templatePath, "utf8");
const serverEntry = await import(pathToFileURL(serverEntryPath).href);

for (const routePath of serverEntry.marketingPrerenderRoutes) {
	const { appHtml, seo } = serverEntry.render(routePath);
	const outputPath = getOutputPath(routePath);
	const outputDir = path.dirname(outputPath);
	let html = template;

	html = withReplacedTag(
		html,
		/<title>.*?<\/title>/s,
		`<title>${escapeHtml(seo.title)}</title>`,
		"title",
	);
	html = withReplacedTag(
		html,
		/<meta name="description" content="[^"]*"[^>]*>/,
		`<meta name="description" content="${escapeHtml(seo.description)}" />`,
		"description meta",
	);
	html = withReplacedTag(
		html,
		/<meta name="theme-color" content="[^"]*"[^>]*>/,
		`<meta name="theme-color" content="${escapeHtml(seo.themeColor ?? "#f3f8f3")}" />`,
		"theme-color meta",
	);
	html = withReplacedTag(
		html,
		/<div id="root"><\/div>/,
		`<div id="root">${appHtml}</div>`,
		"root container",
	);
	html = html.replace(
		"</head>",
		`    ${buildHeadTags(seo, serverEntry.SITE_URL)}\n  </head>`,
	);

	await mkdir(outputDir, { recursive: true });
	await writeFile(outputPath, html, "utf8");
}

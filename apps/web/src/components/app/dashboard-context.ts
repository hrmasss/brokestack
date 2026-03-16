const dashboardLabels: Record<string, string> = {
	"/dashboard": "Overview",
	"/dashboard/posts": "Runs",
	"/dashboard/posts/new": "Launch Run",
	"/dashboard/calendar": "Calendar",
	"/dashboard/analytics": "Usage",
	"/dashboard/images": "Images",
	"/dashboard/images/new": "Generate Image",
	"/dashboard/images/batch": "Generate Batch",
	"/dashboard/images/connections": "Connections",
	"/dashboard/api": "API",
	"/dashboard/api/docs": "API Docs",
	"/dashboard/automations": "Images",
	"/dashboard/library": "Artifacts",
	"/dashboard/team": "Team",
	"/dashboard/settings": "Settings",
};

export function formatBreadcrumbLabel(segment: string) {
	return segment
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function getDashboardBreadcrumbs(pathname: string) {
	const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);

	return segments
		.map((_, index) => `/${segments.slice(0, index + 1).join("/")}`)
		.filter((path) => path.startsWith("/dashboard"))
		.map((path) => ({
			href: path,
			label:
				dashboardLabels[path] ??
				formatBreadcrumbLabel(
					path.split("/").filter(Boolean).at(-1) ?? "Overview",
				),
		}));
}

export function getDashboardContextLabel(pathname: string) {
	return (
		dashboardLabels[pathname] ??
		formatBreadcrumbLabel(
			pathname.split("/").filter(Boolean).at(-1) ?? "Overview",
		)
	);
}

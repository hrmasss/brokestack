import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";

import { AppRoutes } from "@/app-routes";
import { getSeoForPath, marketingPrerenderRoutes, SITE_URL } from "@/lib/seo";

export { marketingPrerenderRoutes, SITE_URL };

export function render(url: string) {
	const seo = getSeoForPath(url);
	const appHtml = renderToString(
		<StaticRouter location={url}>
			<AppRoutes />
		</StaticRouter>,
	);

	return {
		appHtml,
		seo,
	};
}

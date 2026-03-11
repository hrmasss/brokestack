import { createContext, useContext, type RefObject } from "react";

export const MarketingScrollViewportContext =
	createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useMarketingScrollViewport() {
	return useContext(MarketingScrollViewportContext);
}

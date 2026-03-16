import { Bot, Sparkles } from "lucide-react";
import { RiGeminiLine } from "@remixicon/react";

import type { ProviderLoginSession } from "@/lib/api-types";

export const activeImageJobStates = new Set([
	"queued",
	"starting",
	"awaiting_login",
	"navigating",
	"submitting_prompt",
	"generating",
	"downloading",
]);

export const accountStatusStyles: Record<string, string> = {
	ready: "pill pill-success",
	busy: "pill pill-warning",
	pending_login: "pill pill-info",
	needs_reauth: "pill pill-warning",
	error:
		"rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive",
};

export const imageJobStatusStyles: Record<string, string> = {
	completed: "pill pill-success",
	failed:
		"rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive",
	queued: "pill pill-info",
	starting: "pill pill-info",
	awaiting_login: "pill pill-warning",
	navigating: "pill pill-info",
	submitting_prompt: "pill pill-info",
	generating: "pill pill-warning",
	downloading: "pill pill-info",
};

export const loginSessionStatusStyles: Record<string, string> = {
	launching: "pill pill-info",
	ready_for_user: "pill pill-info",
	auth_in_progress: "pill pill-warning",
	ready: "pill pill-success",
	failed:
		"rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive",
	expired:
		"rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive",
};

export const providerCards = [
	{
		id: "chatgpt",
		label: "ChatGPT",
		state: "Available now",
		icon: Bot,
	},
	{
		id: "gemini",
		label: "Gemini",
		state: "Coming soon",
		icon: RiGeminiLine,
	},
	{
		id: "grok",
		label: "Grok",
		state: "Coming soon",
		icon: Sparkles,
	},
];

export function formatDashboardDate(value?: string) {
	if (!value) {
		return "Pending";
	}
	return new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value));
}

export function isLoginSessionTerminal(session: ProviderLoginSession | null) {
	if (!session) {
		return true;
	}
	return (
		session.sessionStatus === "ready" ||
		session.sessionStatus === "failed" ||
		session.sessionStatus === "expired" ||
		Boolean(session.completedAt)
	);
}

export function resolveApiBase() {
	const configuredBase = import.meta.env.VITE_API_URL?.trim();
	if (import.meta.env.DEV) {
		return "";
	}
	return configuredBase?.endsWith("/")
		? configuredBase.slice(0, -1)
		: (configuredBase ?? "");
}

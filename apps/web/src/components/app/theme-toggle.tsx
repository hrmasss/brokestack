import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "brokestack-theme";

function resolveTheme(): ThemeMode {
	if (typeof window === "undefined") {
		return "dark";
	}

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark") {
		return stored;
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function applyTheme(theme: ThemeMode) {
	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(theme);
	localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle({
	className,
	compact = false,
}: {
	className?: string;
	compact?: boolean;
}) {
	const [theme, setTheme] = useState<ThemeMode>("dark");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const nextTheme = resolveTheme();
		setTheme(nextTheme);
		setMounted(true);
		applyTheme(nextTheme);
	}, []);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		applyTheme(theme);
	}, [mounted, theme]);

	return (
		<button
			type="button"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className={cn(
				"inline-flex items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground",
				compact ? "size-9" : "size-10",
				className,
			)}
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
		>
			{theme === "dark" ? (
				<Sun className="size-4" />
			) : (
				<Moon className="size-4" />
			)}
		</button>
	);
}

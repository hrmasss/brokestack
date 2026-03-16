import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";

import { BrandBackdrop } from "@/components/app/brand";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

import {
	MarketingScrollViewportContext,
	useMarketingScrollViewport,
} from "./scroll-context";

const navLinks = [
	{ href: "/features", label: "Product" },
	{ href: "/pricing", label: "Pricing" },
	{ href: "/blog", label: "Blog" },
	{ href: "/about", label: "Company" },
];

function isActivePath(currentPath: string, href: string) {
	return currentPath === href || currentPath.startsWith(`${href}/`);
}

function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const location = useLocation();
	const scrollViewportRef = useMarketingScrollViewport();
	const { customerSession } = useAuth();
	const signedIn = Boolean(customerSession);

	useEffect(() => {
		const viewport = scrollViewportRef?.current;
		const onScroll = () =>
			setScrolled((viewport?.scrollTop ?? window.scrollY) > 10);

		onScroll();
		if (viewport) {
			viewport.addEventListener("scroll", onScroll, { passive: true });
			return () => viewport.removeEventListener("scroll", onScroll);
		}

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [scrollViewportRef]);

	useEffect(() => {
		setMenuOpen(false);
	}, [location.pathname]);

	return (
		<header className="fixed inset-x-0 top-0 z-50">
			<div className="page-container pt-4">
				<div
					className={cn(
						"glass rounded-full px-4 transition-all duration-300 md:px-5",
						scrolled
							? "shadow-[0_20px_50px_-30px_rgba(32,16,11,0.55)]"
							: "shadow-none",
					)}
				>
					<div className="flex h-16 items-center justify-between gap-4">
						<Link to="/" className="flex items-center">
							<Logo size="sm" showText />
						</Link>

						<nav className="hidden items-center gap-1 md:flex">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									to={link.href}
									className={cn(
										"rounded-full px-4 py-2 text-sm transition-colors",
										isActivePath(location.pathname, link.href)
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{link.label}
								</Link>
							))}
						</nav>

						<div className="hidden items-center gap-2 md:flex">
							<ThemeToggle compact className="size-10" />
							{signedIn ? (
								<Button
									className="h-10 rounded-full bg-gradient-brand px-5 text-white border-0"
									asChild
								>
									<Link to="/dashboard">
										Open app
										<ArrowRight className="size-4" />
									</Link>
								</Button>
							) : (
								<>
									<Button
										variant="outline"
										className="h-10 rounded-full border-[var(--brand-border-soft)] bg-background/40 px-5 backdrop-blur-sm"
										asChild
									>
										<Link to="/login">Sign in</Link>
									</Button>
									<Button
										className="h-10 rounded-full bg-gradient-brand px-5 text-white border-0"
										asChild
									>
										<Link to="/signup">
											Start free
											<ArrowRight className="size-4" />
										</Link>
									</Button>
								</>
							)}
						</div>

						<div className="flex items-center gap-2 md:hidden">
							<ThemeToggle compact className="size-10" />
							<Button
								variant="ghost"
								className="size-10 rounded-full"
								onClick={() => setMenuOpen((value) => !value)}
							>
								{menuOpen ? (
									<X className="size-4" />
								) : (
									<Menu className="size-4" />
								)}
							</Button>
						</div>
					</div>
				</div>

				{menuOpen ? (
					<div className="glass mt-3 rounded-[28px] p-4 md:hidden">
						<div className="space-y-2">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									to={link.href}
									className="block rounded-2xl px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent"
								>
									{link.label}
								</Link>
							))}
						</div>
						<div className="mt-4 flex flex-col gap-2">
							{signedIn ? (
								<Button
									className="h-10 justify-center rounded-full bg-gradient-brand text-white border-0"
									asChild
								>
									<Link to="/dashboard">
										Open app
										<ArrowRight className="size-4" />
									</Link>
								</Button>
							) : (
								<>
									<Button
										variant="outline"
										className="h-10 justify-center rounded-full border-[var(--brand-border-soft)] bg-background/40"
										asChild
									>
										<Link to="/login">Sign in</Link>
									</Button>
									<Button
										className="h-10 justify-center rounded-full bg-gradient-brand text-white border-0"
										asChild
									>
										<Link to="/signup">
											Start free
											<ArrowRight className="size-4" />
										</Link>
									</Button>
								</>
							)}
						</div>
					</div>
				) : null}
			</div>
		</header>
	);
}

function Footer() {
	return (
		<footer className="border-t border-[var(--brand-border-soft)] py-10">
			<div className="page-container">
				{/* Newsletter Section */}
				<div className="surface-panel-strong rounded-[32px] px-6 py-10 md:px-10 md:py-12 mb-8 relative overflow-hidden">
					<div className="brand-grid absolute inset-0 opacity-10" />
					<div className="relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:text-left md:justify-between">
						<div className="max-w-md">
							<div className="text-xl font-semibold tracking-tight md:text-2xl">
								Stay ahead of the curve
							</div>
							<p className="mt-2 text-sm text-muted-foreground">
								Get weekly insights on automation workflows, product updates,
								and practical tool-building straight to your inbox.
							</p>
						</div>
						<form
							className="flex w-full max-w-sm gap-2"
							onSubmit={(e) => e.preventDefault()}
						>
							<input
								type="email"
								placeholder="you@company.com"
								className="h-12 flex-1 rounded-full border border-[var(--brand-border-soft)] bg-background/70 px-4 text-sm backdrop-blur-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
							/>
							<Button className="h-12 rounded-full bg-gradient-brand px-6 text-white border-0 shrink-0">
								Subscribe
							</Button>
						</form>
					</div>
				</div>

				{/* Main Footer */}
				<div className="surface-panel rounded-[32px] px-6 py-8 md:px-8">
					<div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
						<div className="space-y-4">
							<Logo size="sm" showText />
							<p className="max-w-sm text-sm text-muted-foreground">
								The automation workspace for modern teams. Run tools, automate
								workflows, and measure usage in one place.
							</p>
							<div className="flex items-center gap-3 pt-1">
								<a
									href="https://x.com"
									className="flex size-9 items-center justify-center rounded-xl border border-[var(--brand-border-soft)] text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
									aria-label="X (Twitter)"
								>
									<svg
										className="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M4 4l11.733 16h4.267l-11.733 -16h-4.267z" />
										<path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
									</svg>
								</a>
								<a
									href="https://linkedin.com"
									className="flex size-9 items-center justify-center rounded-xl border border-[var(--brand-border-soft)] text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
									aria-label="LinkedIn"
								>
									<svg
										className="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
										<path d="M8 11l0 5" />
										<path d="M8 8l0 .01" />
										<path d="M12 16l0 -5" />
										<path d="M16 16v-3a2 2 0 0 0 -4 0" />
									</svg>
								</a>
								<a
									href="https://github.com"
									className="flex size-9 items-center justify-center rounded-xl border border-[var(--brand-border-soft)] text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
									aria-label="GitHub"
								>
									<svg
										className="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
									</svg>
								</a>
							</div>
						</div>

						<div className="space-y-3">
							<div className="text-sm font-medium">Product</div>
							<div className="space-y-2 text-sm text-muted-foreground">
								<Link
									to="/features"
									className="block transition-colors hover:text-foreground"
								>
									Features
								</Link>
								<Link
									to="/pricing"
									className="block transition-colors hover:text-foreground"
								>
									Pricing
								</Link>
								<Link
									to="/dashboard"
									className="block transition-colors hover:text-foreground"
								>
									Dashboard
								</Link>
								<Link
									to="/dashboard/analytics"
									className="block transition-colors hover:text-foreground"
								>
									Analytics
								</Link>
							</div>
						</div>

						<div className="space-y-3">
							<div className="text-sm font-medium">Company</div>
							<div className="space-y-2 text-sm text-muted-foreground">
								<Link
									to="/about"
									className="block transition-colors hover:text-foreground"
								>
									About
								</Link>
								<Link
									to="/blog"
									className="block transition-colors hover:text-foreground"
								>
									Blog
								</Link>
								<a
									href="mailto:team@memofi.tech"
									className="block transition-colors hover:text-foreground"
								>
									Contact
								</a>
								<a
									href="#"
									className="block transition-colors hover:text-foreground"
								>
									Careers
								</a>
							</div>
						</div>

						<div className="space-y-3">
							<div className="text-sm font-medium">Resources</div>
							<div className="space-y-2 text-sm text-muted-foreground">
								<a
									href="#"
									className="block transition-colors hover:text-foreground"
								>
									Documentation
								</a>
								<a
									href="#"
									className="block transition-colors hover:text-foreground"
								>
									API Reference
								</a>
								<a
									href="#"
									className="block transition-colors hover:text-foreground"
								>
									Changelog
								</a>
								<a
									href="#"
									className="block transition-colors hover:text-foreground"
								>
									Status Page
								</a>
							</div>
						</div>

						<div className="space-y-3">
							<div className="text-sm font-medium">Legal</div>
							<div className="space-y-2 text-sm text-muted-foreground">
								<a
									href="#"
									className="block transition-colors hover:text-foreground"
								>
									Privacy Policy
								</a>
								<a
									href="#"
									className="block transition-colors hover:text-foreground"
								>
									Terms of Service
								</a>
								<a
									href="#"
									className="block transition-colors hover:text-foreground"
								>
									Cookie Policy
								</a>
								<a
									href="#"
									className="block transition-colors hover:text-foreground"
								>
									Security
								</a>
							</div>
						</div>
					</div>

					<div className="mt-8 flex flex-col gap-3 border-t border-[var(--brand-border-soft)] pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
						<div>
							© {new Date().getFullYear()} Memofi. Built for deliberate teams.
						</div>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1.5">
								<div className="size-2 rounded-full bg-[var(--brand-success)]" />
								<span>All systems operational</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

export function MarketingLayout() {
	const scrollViewportRef = useRef<HTMLDivElement>(null);

	return (
		<MarketingScrollViewportContext.Provider value={scrollViewportRef}>
			<div className="app-shell h-[100dvh] overflow-hidden">
				<BrandBackdrop />
				<Navbar />
				<ScrollArea
					type="scroll"
					scrollHideDelay={180}
					className="marketing-content-scroll relative z-10 h-full min-w-0"
					viewportRef={scrollViewportRef}
					viewportClassName="marketing-content-viewport overflow-x-hidden"
					scrollbarClassName="marketing-content-scrollbar"
					thumbClassName="marketing-content-scrollbar-thumb"
				>
					<div className="min-h-full w-full min-w-0">
						<main className="relative z-10 w-full min-w-0">
							<Outlet />
						</main>
						<Footer />
					</div>
				</ScrollArea>
			</div>
		</MarketingScrollViewportContext.Provider>
	);
}

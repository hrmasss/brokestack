import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function BrandBackdrop({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-0 overflow-hidden",
				className,
			)}
		>
			<div className="hero-halo left-[-12rem] top-[-8rem] h-[24rem] w-[24rem] bg-[var(--brand-glow-strong)]" />
			<div className="hero-halo right-[-10rem] top-[15rem] h-[22rem] w-[22rem] bg-[var(--brand-glow)]" />
			<div className="brand-grid absolute inset-x-0 top-0 h-[32rem] opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
		</div>
	);
}

export function SectionTag({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return <div className={cn("section-kicker", className)}>{children}</div>;
}

export function SectionHeading({
	align = "left",
	badge,
	title,
	description,
	className,
}: {
	align?: "left" | "center";
	badge?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"space-y-4",
				align === "center" && "mx-auto max-w-3xl text-center",
				className,
			)}
		>
			{badge}
			<h2 className="section-title">{title}</h2>
			{description ? <p className="section-copy">{description}</p> : null}
		</div>
	);
}

export function SurfaceCard({
	className,
	tone = "default",
	...props
}: HTMLAttributes<HTMLDivElement> & {
	tone?: "default" | "strong" | "muted";
}) {
	return (
		<div
			className={cn(
				"rounded-[28px]",
				tone === "default" && "surface-panel",
				tone === "strong" && "surface-panel-strong",
				tone === "muted" && "surface-panel-muted",
				className,
			)}
			{...props}
		/>
	);
}

export function StatChip({
	label,
	value,
	detail,
}: {
	label: string;
	value: string;
	detail?: string;
}) {
	return (
		<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/60 px-4 py-3 backdrop-blur-sm">
			<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
				{label}
			</div>
			<div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
			{detail ? (
				<div className="mt-1 text-sm text-muted-foreground">{detail}</div>
			) : null}
		</div>
	);
}

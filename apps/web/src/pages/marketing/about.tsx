import {
	ArrowRight,
	Compass,
	Eye,
	ShieldCheck,
	Sparkles,
	Users2,
} from "lucide-react";
import { Link } from "react-router";

import {
	SectionHeading,
	SectionTag,
	SurfaceCard,
} from "@/components/app/brand";
import { Button } from "@/components/ui/button";

const values = [
	{
		icon: Eye,
		title: "Clarity over activity",
		description:
			"We design for teams that need better judgment, not just more throughput. Every surface should help people see tradeoffs faster.",
	},
	{
		icon: ShieldCheck,
		title: "Rigor without drag",
		description:
			"Approvals, permissions, and audits should protect the work without turning operators into administrators.",
	},
	{
		icon: Users2,
		title: "Shared context",
		description:
			"Tool stacks fail when information is fragmented. We build for cross-functional teams that need one dependable operating picture.",
	},
];

const timeline = [
	{
		year: "2021",
		title: "Company formed",
		detail:
			"Started around one question: why do useful tools still end up stitched together with glue code?",
	},
	{
		year: "2023",
		title: "First serious operators",
		detail:
			"Learned that the real problem is workflow structure, not just shipping faster.",
	},
	{
		year: "2025",
		title: "Unified control layer",
		detail:
			"Brought runs, tables, dashboards, and workflow loops into one shared system.",
	},
];

function HeroSection() {
	return (
		<section className="pt-32">
			<div className="page-container section-spacing">
				<div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
					<SectionHeading
						badge={<SectionTag>About BrokeStack</SectionTag>}
						title="Built for teams who treat automation as a real operating discipline."
						description="BrokeStack is named with a bit of edge, but the product is really about structure: helping teams work in a calmer, more connected way from setup to execution."
					/>
					<SurfaceCard tone="strong" className="p-6 md:p-8">
						<div className="grid gap-4 sm:grid-cols-3">
							{[
								["12", "Countries with active teams"],
								["9.4M+", "Runs coordinated"],
								["4.9/5", "Customer design rating"],
							].map((item) => (
								<div
									key={item[1]}
									className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/70 p-5"
								>
									<div className="text-3xl font-semibold tracking-tight">
										{item[0]}
									</div>
									<div className="mt-2 text-sm text-muted-foreground">
										{item[1]}
									</div>
								</div>
							))}
						</div>
						<div className="mt-5 rounded-[26px] border border-[var(--brand-border-soft)] bg-background/75 p-6">
							<div className="flex items-center gap-3 text-primary">
								<Compass className="size-5" />
								<span className="font-medium">What guides us</span>
							</div>
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								We build software that respects the craft and cadence of modern
								operators. The goal is not maximal interface noise. The goal is
								sharper control.
							</p>
						</div>
					</SurfaceCard>
				</div>
			</div>
		</section>
	);
}

function ValuesSection() {
	return (
		<section className="section-spacing-sm">
			<div className="page-container">
				<SectionHeading
					align="center"
					badge={<SectionTag className="mx-auto">Values</SectionTag>}
					title="Product principles, not poster slogans."
					description="The visual polish matters, but only if it supports a stronger operating model."
				/>
				<div className="mt-10 grid gap-6 md:grid-cols-3">
					{values.map((value) => (
						<SurfaceCard key={value.title} className="p-6">
							<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<value.icon className="size-5" />
							</div>
							<div className="mt-5 text-lg font-medium tracking-tight">
								{value.title}
							</div>
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								{value.description}
							</p>
						</SurfaceCard>
					))}
				</div>
			</div>
		</section>
	);
}

function TimelineSection() {
	return (
		<section className="section-spacing-sm">
			<div className="page-container">
				<SurfaceCard className="p-6 md:p-8">
					<SectionHeading
						badge={<SectionTag>Journey</SectionTag>}
						title="The company grew by following operators, not trends."
						description="Every major shift in the product came from watching teams patch around disconnected tools and brittle workflows."
					/>
					<div className="mt-8 grid gap-4 lg:grid-cols-3">
						{timeline.map((item) => (
							<div
								key={item.year}
								className="rounded-[26px] border border-[var(--brand-border-soft)] bg-background/72 p-5"
							>
								<div className="text-xs uppercase tracking-[0.22em] text-[var(--brand-accent)]">
									{item.year}
								</div>
								<div className="mt-3 text-lg font-medium">{item.title}</div>
								<p className="mt-2 text-sm leading-6 text-muted-foreground">
									{item.detail}
								</p>
							</div>
						))}
					</div>
				</SurfaceCard>
			</div>
		</section>
	);
}

function CTASection() {
	return (
		<section className="section-spacing">
			<div className="page-container">
				<SurfaceCard
					tone="strong"
					className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10"
				>
					<div className="max-w-2xl space-y-3">
						<SectionTag>
							<Sparkles className="size-3.5" />
							Continue the tour
						</SectionTag>
						<h2 className="text-3xl font-semibold tracking-tight">
							See how that thinking shows up inside the product.
						</h2>
						<p className="text-muted-foreground">
							The dashboard now carries the same restraint and structure as the
							public site, so the experience feels continuous instead of
							switching personalities at sign-in.
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							size="lg"
							className="rounded-full bg-gradient-brand px-6 text-white border-0"
							asChild
						>
							<Link to="/dashboard">
								Open dashboard
								<ArrowRight className="size-4" />
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="rounded-full px-6"
							asChild
						>
							<Link to="/pricing">View plans</Link>
						</Button>
					</div>
				</SurfaceCard>
			</div>
		</section>
	);
}

export function AboutPage() {
	return (
		<>
			<HeroSection />
			<ValuesSection />
			<TimelineSection />
			<CTASection />
		</>
	);
}

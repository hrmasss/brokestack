import {
	ArrowRight,
	BarChart3,
	CalendarDays,
	MessageCircleMore,
	ShieldCheck,
	Sparkles,
	WandSparkles,
} from "lucide-react";
import { Link } from "react-router";

import {
	SectionHeading,
	SectionTag,
	SurfaceCard,
} from "@/components/app/brand";
import { Button } from "@/components/ui/button";

const workflowHighlights = [
	{
		icon: CalendarDays,
		title: "Queue runs with context",
		description:
			"Map tool runs against dates, owners, dependencies, and quotas so the whole team sees what needs attention next.",
	},
	{
		icon: ShieldCheck,
		title: "Keep workflows moving",
		description:
			"Route checks to the right owners, surface blockers early, and maintain a clean record of what is ready to execute.",
	},
	{
		icon: MessageCircleMore,
		title: "Keep operational context attached",
		description:
			"Comments and next steps stay connected to runs, artifacts, and tools, so context does not disappear into chat threads.",
	},
	{
		icon: BarChart3,
		title: "Measure what ran",
		description:
			"See usage, failures, and delivery signals in the same workspace where the next round of decisions gets made.",
	},
];

const executionFlow = [
	{
		label: "Input",
		title: "Define the run clearly",
		description:
			"Capture inputs, owner, schedule, and dependencies before execution starts to fragment.",
	},
	{
		label: "Queue",
		title: "Stage runs in one place",
		description:
			"Keep credentials, quotas, and file readiness visible so nobody is chasing the latest state over email or chat.",
	},
	{
		label: "Run",
		title: "Execute with fewer handoffs",
		description:
			"Scheduling, worker readiness, and required checks stay connected, which reduces last-minute manual coordination.",
	},
	{
		label: "Learn",
		title: "Turn outputs into the next move",
		description:
			"Use run history, usage signals, and outputs to decide what to repeat, revise, or retire in the next cycle.",
	},
];

const systemBlocks = [
	{
		icon: BarChart3,
		title: "Usage that stays contextual",
		copy: "See run output, API demand, and delivery trendlines in the same environment where scheduling decisions are made.",
	},
	{
		icon: ShieldCheck,
		title: "Governance that doesn’t slow the room",
		copy: "Workspace roles, access policies, and audit trails are integrated into the product surface instead of bolted on after the fact.",
	},
	{
		icon: MessageCircleMore,
		title: "Communication attached to objects",
		copy: "Feedback and next steps stay connected to runs, rows, and artifacts, so there is less off-platform context to reconstruct later.",
	},
	{
		icon: WandSparkles,
		title: "AI where it actually helps",
		copy: "Generate prompts, summarize failures, and surface patterns without drowning the interface in novelty features.",
	},
];

function HeroSection() {
	return (
		<section className="pt-32">
			<div className="page-container section-spacing">
				<SectionHeading
					align="center"
					badge={
						<SectionTag className="mx-auto">
							<Sparkles className="size-3.5" />
							Product depth
						</SectionTag>
					}
					title={
						<>
							A richer workspace for the teams who need{" "}
							<span className="text-gradient-brand">more than a script folder</span>
							.
						</>
					}
					description="BrokeStack brings tool runs, workflows, artifacts, usage, and API access into one consistent interface designed for practical operators."
				/>
			</div>
		</section>
	);
}

function WorkflowSection() {
	return (
		<section className="section-spacing-sm">
			<div className="page-container grid gap-6 lg:grid-cols-[1fr_1.05fr]">
				<SurfaceCard tone="strong" className="p-6 md:p-8">
					<SectionHeading
						badge={<SectionTag>Operator flow</SectionTag>}
						title="One place for the full execution cycle."
						description="BrokeStack keeps inputs, workflows, runs, and usage connected so the team can move without handoff drift."
					/>
					<div className="mt-8 grid gap-4">
						{workflowHighlights.map((lane) => (
							<div
								key={lane.title}
								className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/70 p-4"
							>
								<div className="flex items-center gap-3 text-primary">
									<lane.icon className="size-5" />
									<div className="font-medium text-foreground">
										{lane.title}
									</div>
								</div>
								<p className="mt-3 text-sm leading-6 text-muted-foreground">
									{lane.description}
								</p>
							</div>
						))}
					</div>
				</SurfaceCard>

				<SurfaceCard className="overflow-hidden p-4 md:p-6">
					<div className="rounded-[28px] border border-[var(--brand-border-soft)] bg-background/75 p-5 md:p-6">
						<SectionHeading
							badge={<SectionTag>Execution rhythm</SectionTag>}
							title="From setup to outputs, the room stays aligned."
							description="Each stage carries the right context forward, so operators and leads can act without rebuilding the story from scratch."
						/>

						<div className="mt-8 space-y-4">
							{executionFlow.map((step) => (
								<div
									key={step.label}
									className="rounded-[24px] border border-[var(--brand-border-soft)] bg-card/90 p-4"
								>
									<div className="flex items-center justify-between gap-3">
										<div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--brand-accent)]">
											{step.label}
										</div>
										<div className="pill pill-muted">Connected</div>
									</div>
									<div className="mt-3 text-lg font-medium tracking-tight">
										{step.title}
									</div>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">
										{step.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</SurfaceCard>
			</div>
		</section>
	);
}

function SystemSection() {
	return (
		<section className="section-spacing-sm">
			<div className="page-container">
				<SectionHeading
					align="center"
					badge={
						<SectionTag className="mx-auto">What stays connected</SectionTag>
					}
					title="A workspace built for clarity under pressure."
					description="Whether the team is scheduling, reviewing, running, or learning from outputs, BrokeStack keeps the important signals close to the action."
				/>
				<div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
					{systemBlocks.map((block) => (
						<SurfaceCard key={block.title} className="p-6">
							<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<block.icon className="size-5" />
							</div>
							<div className="mt-5 text-lg font-medium tracking-tight">
								{block.title}
							</div>
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								{block.copy}
							</p>
						</SurfaceCard>
					))}
				</div>
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
						<SectionTag>See it live</SectionTag>
						<h2 className="text-3xl font-semibold tracking-tight">
							Open the workspace and follow the team in motion.
						</h2>
						<p className="text-muted-foreground">
							Move from runs to usage, calendar, artifacts, team, and
							workflows in a single product flow built for day-to-day
							automation operations.
						</p>
					</div>
					<Button
						size="lg"
						className="rounded-full bg-gradient-brand px-6 text-white border-0"
						asChild
					>
						<Link to="/dashboard/posts">
							Open runs workspace
							<ArrowRight className="size-4" />
						</Link>
					</Button>
				</SurfaceCard>
			</div>
		</section>
	);
}

export function FeaturesPage() {
	return (
		<>
			<HeroSection />
			<WorkflowSection />
			<SystemSection />
			<CTASection />
		</>
	);
}

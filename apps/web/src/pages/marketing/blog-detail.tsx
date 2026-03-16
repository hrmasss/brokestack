import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	Bot,
	CalendarDays,
	Check,
	ChevronRight,
	Clock,
	Copy,
	Facebook,
	Hash,
	Linkedin,
	List,
	Megaphone,
	MessageSquareText,
	Newspaper,
	Share2,
	Sparkles,
	TrendingUp,
	Twitter,
} from "lucide-react";
import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Link, useParams } from "react-router";

import { SectionTag, SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useMarketingScrollViewport } from "./scroll-context";

/* ================================================================
   HOOKS
   ================================================================ */

function useInView(threshold = 0.15) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [threshold]);

	return { ref, visible };
}

function useActiveSection(sectionIds: string[]) {
	const [activeId, setActiveId] = useState<string>("");

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{ rootMargin: "-20% 0px -60% 0px", threshold: 0.1 },
		);

		for (const id of sectionIds) {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, [sectionIds]);

	return activeId;
}

function useSpotlight() {
	return useCallback((e: ReactMouseEvent<HTMLElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		e.currentTarget.style.setProperty(
			"--spotlight-x",
			`${e.clientX - rect.left}px`,
		);
		e.currentTarget.style.setProperty(
			"--spotlight-y",
			`${e.clientY - rect.top}px`,
		);
	}, []);
}

/* ================================================================
   DATA — full blog posts including content
   ================================================================ */

interface BlogChapter {
	id: string;
	title: string;
}

interface BlogPost {
	slug: string;
	category: string;
	title: string;
	excerpt: string;
	date: string;
	isoDate: string;
	readingTime: string;
	author: { name: string; initials: string; role: string };
	tldr: string;
	chapters: BlogChapter[];
	content: { id: string; heading: string; body: string[] }[];
}

const thumbThemes: Record<string, { bg: string; accent: string }> = {
	Operations: {
		bg: "linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 18%, var(--brand-panel-strong)) 0%, color-mix(in srgb, var(--brand-accent) 22%, var(--brand-panel)) 100%)",
		accent: "var(--brand-primary)",
	},
	Planning: {
		bg: "linear-gradient(150deg, color-mix(in srgb, var(--brand-secondary) 20%, var(--brand-panel-strong)) 0%, color-mix(in srgb, var(--brand-info) 16%, var(--brand-panel)) 100%)",
		accent: "var(--brand-info)",
	},
	Approvals: {
		bg: "linear-gradient(125deg, color-mix(in srgb, var(--brand-warning) 16%, var(--brand-panel-strong)) 0%, color-mix(in srgb, var(--brand-secondary) 18%, var(--brand-panel)) 100%)",
		accent: "var(--brand-warning)",
	},
	"Product update": {
		bg: "linear-gradient(160deg, color-mix(in srgb, var(--brand-success) 14%, var(--brand-panel-strong)) 0%, color-mix(in srgb, var(--brand-primary) 16%, var(--brand-panel)) 100%)",
		accent: "var(--brand-success)",
	},
	Analytics: {
		bg: "linear-gradient(140deg, color-mix(in srgb, var(--brand-info) 20%, var(--brand-panel-strong)) 0%, color-mix(in srgb, var(--brand-accent) 14%, var(--brand-panel)) 100%)",
		accent: "var(--brand-info)",
	},
	Governance: {
		bg: "linear-gradient(130deg, color-mix(in srgb, var(--brand-accent) 22%, var(--brand-panel-strong)) 0%, color-mix(in srgb, var(--brand-danger) 12%, var(--brand-panel)) 100%)",
		accent: "var(--brand-accent)",
	},
};

const allPosts: BlogPost[] = [
	{
		slug: "content-ops-scorecard",
		category: "Operations",
		title:
			"The operational scorecard high-performing tool teams actually use",
		excerpt:
			"Most teams track output and call it strategy. The better operators monitor handoff speed, workflow lag, reuse rate, and run readiness together.",
		date: "March 6, 2026",
		isoDate: "2026-03-06",
		readingTime: "6 min read",
		author: {
			name: "Rina Morales",
			initials: "RM",
			role: "Head of Tool Operations",
		},
		tldr: "High-performing tool teams track five operational metrics instead of just output volume: handoff speed, workflow turnaround, artifact reuse rate, run readiness score, and execution velocity. Together these signals reveal whether a team is improving its systems or just producing more noise.",
		chapters: [
			{ id: "why-output-metrics-fail", title: "Why output metrics fail" },
			{ id: "the-five-signals", title: "The five signals that matter" },
			{
				id: "handoff-speed",
				title: "Signal 1 — Handoff speed",
			},
			{
				id: "workflow-turnaround",
				title: "Signal 2 — Workflow turnaround",
			},
			{ id: "asset-reuse-rate", title: "Signal 3 — Asset reuse rate" },
			{
				id: "run-readiness",
				title: "Signal 4 — Run readiness",
			},
			{
				id: "execution-velocity",
				title: "Signal 5 — Execution velocity",
			},
			{
				id: "building-the-scorecard",
				title: "Building the scorecard",
			},
			{
				id: "closing-thoughts",
				title: "Closing thoughts",
			},
		],
		content: [
			{
				id: "why-output-metrics-fail",
				heading: "Why output metrics fail",
				body: [
					"Most tool teams measure whatever is easiest to count: runs triggered, prompts submitted, files generated, requests served. Those numbers look productive because they move upward. But output volume alone does not tell you whether the system moved cleanly, whether queues stayed healthy, or whether the team can repeat the work next week.",
					"The operators we speak with describe the same pattern over and over. The quarter closes with record activity, but workers are fragile, retries are rising, and everyone is compensating with manual cleanup. Throughput can hide a lot of operational debt.",
					"A more honest picture appears when you stop counting deliverables and start measuring the rhythms that produce them. That requires a scorecard built around system health, not vanity output.",
				],
			},
			{
				id: "the-five-signals",
				heading: "The five signals that matter",
				body: [
					"Across strong automation teams, five recurring signals show up again and again. None of them measure volume directly. Each one exposes a friction point that compounds quietly until the platform feels unreliable.",
					"When tracked together on a weekly cadence, these numbers give team leads enough signal to intervene before queues back up, workers drift, or customers start asking what broke.",
				],
			},
			{
				id: "handoff-speed",
				heading: "Signal 1 — Handoff speed",
				body: [
					"Handoff speed measures the average time between one stage finishing and the next stage beginning. In a tool platform, that might be the gap between a request being validated and a worker claiming it, or between an output being generated and someone marking it usable.",
					"Slow handoffs are one of the biggest sources of invisible waste. Nothing looks broken, but work sits idle in a state that nobody feels directly responsible for. Tracking handoff speed makes that idle time visible.",
					"Teams that cut average handoff time by even 30% usually see end-to-end run time fall without adding infrastructure or asking anyone to work faster.",
				],
			},
			{
				id: "workflow-turnaround",
				heading: "Signal 2 — Workflow turnaround",
				body: [
					"Workflow turnaround is the elapsed time from when a run enters a review or dependency queue to when a decision comes back: approved, rejected, retried, or escalated.",
					"This matters because workflow bottlenecks are exponential. One slow decision point does not just delay one run; it creates a backlog that slows everything stacked behind it.",
					"The best teams define explicit expectations for turnaround, whether that is a 10-minute automated check, a same-day human review, or a hard escalation window for stalled runs.",
				],
			},
			{
				id: "asset-reuse-rate",
				heading: "Signal 3 — Asset reuse rate",
				body: [
					"Artifact reuse rate tracks how often an existing prompt, template, workflow, or transformation step is reused instead of rebuilt from scratch.",
					"Low reuse can mean the library is disorganized, the interfaces are too brittle, or the team simply does not trust what already exists. High reuse usually correlates with faster delivery and fewer edge-case mistakes.",
					"This does not mean everything should be templated. It means the team should know what is reusable and make novelty an explicit choice instead of a default habit.",
				],
			},
			{
				id: "run-readiness",
				heading: "Signal 4 — Run readiness",
				body: [
					"Run readiness is a composite score that captures whether a job has everything it needs before execution: valid credentials, required files, owner assignment, quota headroom, and the right environment.",
					"Teams that track readiness weekly catch problems earlier. A run that is only 40% ready two hours before a scheduled window creates a very different conversation from a run that fails at launch time.",
					"The model does not need to be fancy. A weighted checklist that treats blocking dependencies more heavily than cosmetic gaps is enough to produce a useful readiness number.",
				],
			},
			{
				id: "execution-velocity",
				heading: "Signal 5 — Execution velocity",
				body: [
					"Execution velocity measures the end-to-end elapsed time from request creation to usable output. It is a lagging indicator, but it reflects the combined effect of all the upstream signals.",
					"When velocity trends upward, the team has a reason to inspect the other four metrics. When it trends downward, improvements are likely compounding in the right direction.",
					"Track velocity by run type. A logo generator, a browser automation flow, and an API-backed enrichment job should not be blended into one meaningless average.",
				],
			},
			{
				id: "building-the-scorecard",
				heading: "Building the scorecard",
				body: [
					"The scorecard itself should be a lightweight weekly artifact — not another dashboard that competes for attention. A single-page view with five rows, current-week numbers, trailing four-week trend, and a one-line note per metric is enough.",
					"Most teams already have the raw events required to populate these metrics. The real challenge is agreeing on definitions, setting a review rhythm, and discussing the numbers each week instead of leaving them in a chart.",
					"We recommend starting with just two signals, usually handoff speed and workflow turnaround, then adding the rest over two or three sprints. That keeps the habit buildable and avoids the new-dashboard-nobody-opens trap.",
					"The goal isn't perfection. It's creating a shared language for operational quality that sits alongside the output metrics leadership already cares about.",
				],
			},
			{
				id: "closing-thoughts",
				heading: "Closing thoughts",
				body: [
					"Output will always matter. Runs need to finish, APIs need to respond, and tools need to produce usable work. But output alone is noisy. It cannot distinguish a healthy system from one that succeeds through brute force and cleanup.",
					"A tool-ops scorecard built around handoff speed, workflow turnaround, artifact reuse, run readiness, and execution velocity gives operators a way to improve the system instead of only counting its outputs.",
					"The teams that adopt this approach do not always produce more. They produce with less friction, less rework, and less of the invisible coordination tax that makes growing platforms feel harder than they should.",
				],
			},
		],
	},
	{
		slug: "run-calendar-discipline",
		category: "Planning",
		title: "Why an execution calendar fails without owner clarity",
		excerpt:
			"A beautiful calendar is still noise if no one knows who resolves blockers, who signs off, and what moves first when timing shifts.",
		date: "February 25, 2026",
		isoDate: "2026-02-25",
		readingTime: "4 min read",
		author: { name: "Daniel Osei", initials: "DO", role: "Platform Strategist" },
		tldr: "Execution calendars fail not because of tooling but because of ambiguous ownership. Without clear assignment of who resolves blockers, who owns final sign-off, and who reprioritizes when timing shifts, even the best-designed calendar becomes decorative.",
		chapters: [
			{ id: "the-calendar-illusion", title: "The calendar illusion" },
			{ id: "ownership-not-assignment", title: "Ownership vs. assignment" },
			{ id: "three-roles-that-matter", title: "Three roles that matter" },
			{ id: "making-it-stick", title: "Making it stick" },
		],
		content: [
			{
				id: "the-calendar-illusion",
				heading: "The calendar illusion",
				body: [
					"Every operations team eventually builds an execution calendar. Most of them are tidy, color-coded, and perfectly up to date. Many of them still fail the moment reality shifts.",
					"The failure mode is rarely missing dates. It is missing clarity about who does what when the plan changes, and plans always change.",
				],
			},
			{
				id: "ownership-not-assignment",
				heading: "Ownership vs. assignment",
				body: [
					"There's a meaningful difference between assigning someone to a task and giving them ownership of an outcome. Assignment says 'do this thing.' Ownership says 'make sure this thing succeeds, and figure out what's in the way.'",
					"Execution calendars usually handle assignment well. They tell you who owns the scraper, who validates the prompt set, who provisions the key, and who ships the output. What they rarely capture is who decides what happens when a dependency slips and the whole run has to adapt.",
				],
			},
			{
				id: "three-roles-that-matter",
				heading: "Three roles that matter",
				body: [
					"Every execution plan needs three clear roles: a Blocker Resolver who clears obstacles and makes trade-off decisions, a Sign-off Authority who gives final approval and cannot be bypassed, and a Priority Holder who decides what moves first when competing work collides.",
					"These roles might overlap. A single run lead might hold all three. But naming them explicitly changes the team's behavior. Instead of waiting for someone to notice a problem, people know exactly who to escalate to.",
				],
			},
			{
				id: "making-it-stick",
				heading: "Making it stick",
				body: [
					"Add these three roles as required fields in run briefs or workflow templates. Review them in weekly standups. Most importantly, hold the named people accountable for outcomes, not just their assigned tasks.",
					"A calendar with ownership clarity becomes a coordination tool. Without it, it's just a schedule that crumbles under the first surprise.",
				],
			},
		],
	},
	{
		slug: "workflow-sla",
		category: "Approvals",
		title: "Set a workflow SLA before you automate anything",
		excerpt:
			"Automation helps after the team agrees on review expectations. Without that, software only accelerates the confusion already in the room.",
		date: "February 12, 2026",
		isoDate: "2026-02-12",
		readingTime: "5 min read",
		author: {
			name: "Priya Chandler",
			initials: "PC",
			role: "Workflow Architect",
		},
		tldr: "Teams that automate workflows before establishing clear SLAs end up accelerating dysfunction rather than resolving it. Start with explicit turnaround expectations, escalation paths, and decision criteria, then layer automation on top.",
		chapters: [
			{ id: "automation-trap", title: "The automation trap" },
			{ id: "sla-first", title: "SLA-first thinking" },
			{ id: "what-to-define", title: "What to define" },
			{ id: "then-automate", title: "Then automate" },
		],
		content: [
			{
				id: "automation-trap",
				heading: "The automation trap",
				body: [
					"The instinct to automate workflow reviews is understandable. Bottlenecks are painful and software promises to make everything faster. But faster chaos is still chaos.",
					"Without agreed expectations for turnaround times, escalation paths, and decision criteria, automation just moves confusion through the queue more quickly.",
				],
			},
			{
				id: "sla-first",
				heading: "SLA-first thinking",
				body: [
					"A workflow SLA is a team agreement: when a run or artifact enters review, the owner responds within a defined window. That is the entire idea. No complex tooling required.",
					"Defining the SLA forces the conversations that should have already happened: who can approve what, how long is reasonable, and what happens when someone is unavailable.",
				],
			},
			{
				id: "what-to-define",
				heading: "What to define",
				body: [
					"At minimum, define three things: the expected turnaround time, the escalation path when the SLA is missed, and the criteria for what counts as approval versus retry, rejection, or revision.",
					"Write these down. Share them. Reference them in review kickoffs. The specificity is the point.",
				],
			},
			{
				id: "then-automate",
				heading: "Then automate",
				body: [
					"Once the SLA is defined and practiced manually for a few cycles, automation becomes powerful. You can build reminders, auto-escalations, and SLA tracking dashboards that are grounded in real expectations rather than arbitrary defaults.",
					"Software can enforce agreements. It can't create them.",
				],
			},
		],
	},
	{
		slug: "product-update-launch-room",
		category: "Product update",
		title:
			"Launch room updates: tighter decision trails and faster review loops",
		excerpt:
			"We refined run status states, owner visibility, and row-level context so teams can move from input to completion with less manual coordination.",
		date: "January 29, 2026",
		isoDate: "2026-01-29",
		readingTime: "3 min read",
		author: { name: "Memofi Team", initials: "MT", role: "Product Team" },
		tldr: "This product update introduces refined run status states with clearer transitions, improved owner visibility so everyone knows what's blocked, and row-level context that reduces back-and-forth.",
		chapters: [
			{ id: "status-states", title: "Refined status states" },
			{ id: "reviewer-visibility", title: "Reviewer visibility" },
			{ id: "row-context", title: "Row-level context" },
		],
		content: [
			{
				id: "status-states",
				heading: "Refined status states",
				body: [
					"Run status now supports more granular states: Draft, In Review, Changes Requested, Ready, Running, and Completed. Each transition is logged with timestamp and actor, creating a decision trail that is useful for retrospectives and debugging.",
					"The previous three-state model was too coarse for teams managing mixed human and worker-driven flows. These six states map more naturally to how runs actually move through review and execution.",
				],
			},
			{
				id: "reviewer-visibility",
				heading: "Reviewer visibility",
				body: [
					"Every run row now shows the assigned reviewers or owners with their current response status. At a glance, team leads can see who has cleared a run, who has not responded, and who requested changes.",
					"This replaces the previous workflow where you had to open each run to check status, a small friction that compounds quickly at volume.",
				],
			},
			{
				id: "row-context",
				heading: "Row-level context",
				body: [
					"Each run row can now carry a short context note visible directly in the list view. It explains blockers, upcoming deadlines, or decisions needed without forcing a click into every record on the page.",
				],
			},
		],
	},
	{
		slug: "usage-reporting-rhythm",
		category: "Analytics",
		title: "A reporting rhythm that helps teams act before the quarter is over",
		excerpt:
			"Weekly operational signals and monthly narrative reviews beat bloated dashboards that only get opened when leadership asks for them.",
		date: "January 14, 2026",
		isoDate: "2026-01-14",
		readingTime: "5 min read",
		author: {
			name: "Sophie Nakamura",
			initials: "SN",
			role: "Analytics Lead",
		},
		tldr: "Replace quarterly reporting marathons with a two-layer rhythm: lightweight weekly operational snapshots that flag emerging issues, and monthly narrative reviews that contextualize trends and recommend action. This cadence helps teams course-correct inside the quarter rather than discovering problems after it ends.",
		chapters: [
			{ id: "quarterly-trap", title: "The quarterly trap" },
			{ id: "weekly-pulse", title: "Weekly operational pulse" },
			{ id: "monthly-narrative", title: "Monthly narrative review" },
			{ id: "rhythm-over-dashboards", title: "Rhythm over dashboards" },
		],
		content: [
			{
				id: "quarterly-trap",
				heading: "The quarterly trap",
				body: [
					"Quarterly reports arrive too late to be useful. By the time the data is compiled, contextualized, and presented, the quarter is over. The insights describe what happened, not what to do next.",
					"Most teams know this. They still default to quarterly cadences because the alternative — more frequent reporting — feels like more work.",
				],
			},
			{
				id: "weekly-pulse",
				heading: "Weekly operational pulse",
				body: [
					"A weekly pulse is not a report. It's a five-minute artifact: three to five key numbers with directional indicators (up/down/flat) and one sentence of context per metric.",
					"The goal is pattern recognition, not analysis. If failure rate jumps 15% week over week or median latency doubles, the pulse flags it. The investigation happens in the monthly review.",
				],
			},
			{
				id: "monthly-narrative",
				heading: "Monthly narrative review",
				body: [
					"The monthly review is where analysis lives. It synthesizes four weeks of pulse data into a narrative: what changed, why it likely changed, and what the team should consider doing about it.",
					"This is a written document — not a deck. Written narratives force clearer thinking and are easier to reference later when making planning decisions.",
				],
			},
			{
				id: "rhythm-over-dashboards",
				heading: "Rhythm over dashboards",
				body: [
					"Dashboards are useful reference tools. But they don't create action. A reporting rhythm — weekly pulse, monthly narrative — creates a cadence of attention that makes data actionable.",
					"The best analytics teams we've studied don't have better dashboards. They have better habits.",
				],
			},
		],
	},
	{
		slug: "multi-brand-governance",
		category: "Governance",
		title: "The governance model multi-workspace teams need before expansion",
		excerpt:
			"Permissions, templates, and artifact reuse rules should scale with the team. Otherwise every new workspace creates another exception to manage.",
		date: "December 18, 2025",
		isoDate: "2025-12-18",
		readingTime: "7 min read",
		author: { name: "Max Okoro", initials: "MO", role: "Governance Lead" },
		tldr: "Multi-workspace teams need a governance model before they expand, not after. That means codifying permission hierarchies, template inheritance rules, and artifact reuse policies into a framework that can absorb new workspaces without creating ungovernable exceptions.",
		chapters: [
			{ id: "scaling-problem", title: "The scaling problem" },
			{ id: "permission-hierarchy", title: "Permission hierarchies" },
			{ id: "template-inheritance", title: "Template inheritance" },
			{ id: "asset-reuse-policy", title: "Asset reuse policies" },
			{ id: "governance-framework", title: "Building the framework" },
		],
		content: [
			{
				id: "scaling-problem",
				heading: "The scaling problem",
				body: [
					"Every multi-workspace team starts the same way: one workspace, one set of rules, one team that knows everything. Then a second use case arrives. The team copies the playbook, tweaks a few things, and moves on.",
					"By the third or fourth workspace, the original rules are unrecognizable. Each one has its own exceptions, its own approval path, and its own version of the template. Governance becomes a pile of workarounds.",
				],
			},
			{
				id: "permission-hierarchy",
				heading: "Permission hierarchies",
				body: [
					"Permissions should follow a clear hierarchy: platform rules that apply everywhere, workspace-level overrides for specific needs, and environment adjustments for special compliance or customer requirements.",
					"The key principle is inheritance. New workspaces start with sane defaults and only deviate where there is a documented reason. That keeps the exception list short and auditable.",
				],
			},
			{
				id: "template-inheritance",
				heading: "Template inheritance",
				body: [
					"Templates should work like code inheritance. A base template defines structure, required inputs, and operational guardrails. Workspace-specific templates extend the base and modify only what is actually necessary.",
					"This approach prevents template sprawl and makes it possible to push global updates, such as new policy checks or runtime defaults, across every workspace at once.",
				],
			},
			{
				id: "asset-reuse-policy",
				heading: "Asset reuse policies",
				body: [
					"Decide upfront which prompts, templates, and generated artifacts are shared across workspaces and which remain isolated. Define clear tagging and categorization standards so teams can find reusable pieces without asking around.",
					"A good reuse policy reduces duplicate setup work dramatically, but only if it is documented and enforced from the start.",
				],
			},
			{
				id: "governance-framework",
				heading: "Building the framework",
				body: [
					"The governance framework should be a living document reviewed quarterly, updated as new workspaces are added, and owned by a specific role rather than a committee.",
					"Keep it simple: one page for permissions, one page for templates, one page for artifact policies. If it takes longer than 10 minutes to explain the model to a new teammate, it is too complex.",
				],
			},
		],
	},
];

/* ================================================================
   CATEGORY ICON HELPER
   ================================================================ */

function CategoryIcon({
	category,
	className,
}: { category: string; className?: string }) {
	switch (category) {
		case "Operations":
			return <TrendingUp className={className} />;
		case "Planning":
			return <CalendarDays className={className} />;
		case "Approvals":
			return <Newspaper className={className} />;
		case "Product update":
			return <Megaphone className={className} />;
		case "Analytics":
			return <TrendingUp className={className} />;
		case "Governance":
			return <Newspaper className={className} />;
		default:
			return <BookOpen className={className} />;
	}
}

/* ================================================================
   AI SUMMARIZE LINKS
   ================================================================ */

const aiTools = [
	{
		name: "ChatGPT",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				className="size-4"
				aria-hidden="true"
			>
				<path
					d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.985 5.985 0 0 0 .516 4.911 6.046 6.046 0 0 0 6.51 2.9A6.065 6.065 0 0 0 13.209 24a6.046 6.046 0 0 0 5.476-3.346 5.985 5.985 0 0 0 3.998-2.9 6.046 6.046 0 0 0-.743-7.097c.087-.283.137-.57.342-.836Z"
					fill="currentColor"
					opacity="0.15"
				/>
				<path
					d="M12 8v4m0 0v4m0-4h4m-4 0H8"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</svg>
		),
		prompt: (title: string) =>
			`https://chat.openai.com/?q=${encodeURIComponent(`Summarize this article: "${title}"`)}`,
		color: "var(--brand-success)",
	},
	{
		name: "Claude",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				className="size-4"
				aria-hidden="true"
			>
				<rect
					x="3"
					y="3"
					width="18"
					height="18"
					rx="4"
					fill="currentColor"
					opacity="0.15"
				/>
				<path
					d="M8 12h8M12 8v8"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</svg>
		),
		prompt: (title: string) =>
			`https://claude.ai/new?q=${encodeURIComponent(`Summarize this article: "${title}"`)}`,
		color: "var(--brand-warning)",
	},
	{
		name: "Gemini",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				className="size-4"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
				<path
					d="M12 7v10M7 12h10"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</svg>
		),
		prompt: (title: string) =>
			`https://gemini.google.com/?q=${encodeURIComponent(`Summarize this article: "${title}"`)}`,
		color: "var(--brand-info)",
	},
];

/* ================================================================
   SIDEBAR COMPONENTS
   ================================================================ */

function SidebarTLDR({ tldr }: { tldr: string }) {
	const { ref, visible } = useInView(0.1);
	return (
		<div
			ref={ref}
			className={cn(
				"blog-detail-sidebar-card surface-panel rounded-[22px] p-5 transition-all duration-500",
				visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
			)}
		>
			<div className="flex items-center gap-2.5 mb-4">
				<div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<MessageSquareText className="size-4" />
				</div>
				<h3 className="text-sm font-semibold tracking-tight">TL;DR</h3>
			</div>
			<p className="text-[0.82rem] leading-6 text-muted-foreground">{tldr}</p>
		</div>
	);
}

function SidebarChapters({
	chapters,
	activeId,
}: { chapters: BlogChapter[]; activeId: string }) {
	const { ref, visible } = useInView(0.1);
	return (
		<div
			ref={ref}
			className={cn(
				"blog-detail-sidebar-card surface-panel rounded-[22px] p-5 transition-all duration-500 delay-75",
				visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
			)}
		>
			<div className="flex items-center gap-2.5 mb-4">
				<div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<List className="size-4" />
				</div>
				<h3 className="text-sm font-semibold tracking-tight">Chapters</h3>
			</div>
			<div className="blog-detail-chapters-scroll">
				<nav className="space-y-0.5" aria-label="Table of contents">
					{chapters.map((ch, i) => (
						<a
							key={ch.id}
							href={`#${ch.id}`}
							className={cn(
								"blog-detail-toc-link group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.78rem] transition-all duration-200",
								activeId === ch.id
									? "bg-primary/10 text-primary font-medium"
									: "text-muted-foreground hover:text-foreground hover:bg-muted/60",
							)}
						>
							<span
								className={cn(
									"flex size-5 shrink-0 items-center justify-center rounded-md text-[0.65rem] font-semibold transition-colors",
									activeId === ch.id
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
								)}
							>
								{i + 1}
							</span>
							<span className="truncate">{ch.title}</span>
						</a>
					))}
				</nav>
			</div>
		</div>
	);
}

function SidebarShare({ title, slug }: { title: string; slug: string }) {
	const { ref, visible } = useInView(0.1);
	const [copied, setCopied] = useState(false);
	const url =
		typeof window !== "undefined"
			? `${window.location.origin}/blog/${slug}`
			: `/blog/${slug}`;

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [url]);

	const shareLinks = [
		{
			name: "Twitter",
			icon: <Twitter className="size-3.5" />,
			href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
		},
		{
			name: "LinkedIn",
			icon: <Linkedin className="size-3.5" />,
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
		},
		{
			name: "Facebook",
			icon: <Facebook className="size-3.5" />,
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
		},
	];

	return (
		<div
			ref={ref}
			className={cn(
				"blog-detail-sidebar-card surface-panel rounded-[22px] p-5 transition-all duration-500 delay-150",
				visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
			)}
		>
			<div className="flex items-center gap-2.5 mb-4">
				<div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Share2 className="size-4" />
				</div>
				<h3 className="text-sm font-semibold tracking-tight">Share</h3>
			</div>
			<div className="grid grid-cols-4 gap-2">
				{shareLinks.map((link) => (
					<a
						key={link.name}
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						className="blog-detail-share-btn flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-[var(--brand-border-soft)] bg-background/60 px-2 py-2.5 text-[0.68rem] font-medium leading-none text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:text-foreground hover:border-[var(--brand-border-strong)] hover:bg-background/80"
					>
						{link.icon}
						<span className="truncate">
							{link.name === "Twitter" ? "X" : link.name}
						</span>
					</a>
				))}
				<button
					type="button"
					onClick={handleCopy}
					className={cn(
						"blog-detail-share-btn flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-[0.68rem] font-medium leading-none backdrop-blur-sm transition-all duration-200",
						copied
							? "border-[var(--brand-success)] bg-[color-mix(in_srgb,var(--brand-success)_8%,transparent)] text-[var(--brand-success)]"
							: "border-[var(--brand-border-soft)] bg-background/60 text-muted-foreground hover:text-foreground hover:border-[var(--brand-border-strong)] hover:bg-background/80",
					)}
				>
					{copied ? (
						<Check className="size-3.5" />
					) : (
						<Copy className="size-3.5" />
					)}
					<span className="truncate">{copied ? "Copied" : "Copy"}</span>
				</button>
			</div>
		</div>
	);
}

function SidebarAISummarize({ title }: { title: string }) {
	const { ref, visible } = useInView(0.1);
	return (
		<div
			ref={ref}
			className={cn(
				"blog-detail-sidebar-card surface-panel-strong rounded-[22px] p-5 transition-all duration-500 delay-200",
				visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
			)}
		>
			<div className="flex items-center gap-2.5 mb-1">
				<div className="flex size-8 items-center justify-center rounded-xl bg-gradient-brand text-white">
					<Bot className="size-4" />
				</div>
				<div>
					<h3 className="text-sm font-semibold tracking-tight">
						Summarize with AI
					</h3>
				</div>
			</div>
			<div className="mt-4 grid grid-cols-3 gap-2">
				{aiTools.map((tool) => (
					<a
						key={tool.name}
						href={tool.prompt(title)}
						target="_blank"
						rel="noopener noreferrer"
						className="blog-detail-ai-btn group flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-border-soft)] bg-background/50 px-2 py-2.5 text-center transition-all duration-200 hover:border-[var(--brand-border-strong)] hover:bg-background/80"
					>
						<div
							className="flex size-7 items-center justify-center rounded-lg transition-colors"
							style={{
								background: `color-mix(in srgb, ${tool.color} 14%, transparent)`,
								color: tool.color,
							}}
						>
							{tool.icon}
						</div>
						<span className="truncate text-[0.72rem] font-medium">
							{tool.name}
						</span>
					</a>
				))}
			</div>
		</div>
	);
}

/* ================================================================
   HERO THUMBNAIL (reusing blog page pattern)
   ================================================================ */

function DetailHeroThumbnail({
	category,
	title,
}: { category: string; title: string }) {
	const theme = thumbThemes[category] || thumbThemes.Operations;
	return (
		<div
			className="blog-detail-hero-thumb"
			style={{ background: theme.bg } as CSSProperties}
		>
			<div className="blog-detail-hero-thumb-inner">
				<div className="blog-thumb-pattern" style={{ color: theme.accent }} />
				<svg
					className="absolute inset-0 size-full"
					viewBox="0 0 800 300"
					fill="none"
					preserveAspectRatio="xMidYMid slice"
					aria-hidden="true"
				>
					<circle
						cx="680"
						cy="240"
						r="180"
						fill={theme.accent}
						opacity="0.06"
					/>
					<circle cx="120" cy="80" r="60" fill={theme.accent} opacity="0.09" />
					<circle
						cx="400"
						cy="150"
						r="100"
						fill={theme.accent}
						opacity="0.04"
					/>
					<line
						x1="60"
						y1="260"
						x2="340"
						y2="260"
						stroke={theme.accent}
						strokeWidth="1.5"
						opacity="0.12"
					/>
					<line
						x1="60"
						y1="272"
						x2="260"
						y2="272"
						stroke={theme.accent}
						strokeWidth="1"
						opacity="0.08"
					/>
				</svg>

				<div
					className="absolute right-8 bottom-8 flex size-16 items-center justify-center rounded-3xl opacity-15"
					style={{ color: theme.accent }}
				>
					<CategoryIcon category={category} className="size-10" />
				</div>

				<div className="absolute inset-x-8 bottom-8 z-10 hidden lg:block">
					<div
						className="max-w-md text-xl font-semibold leading-snug tracking-tight opacity-[0.08]"
						style={{ color: theme.accent }}
					>
						{title}
					</div>
				</div>
			</div>
			<div className="blog-thumb-overlay" />
		</div>
	);
}

/* ================================================================
   ARTICLE BODY
   ================================================================ */

function ArticleBody({
	content,
}: { content: { id: string; heading: string; body: string[] }[] }) {
	return (
		<div className="blog-detail-article-body">
			{content.map((section) => (
				<section key={section.id} id={section.id} className="scroll-mt-28">
					<h2 className="blog-detail-heading">{section.heading}</h2>
					{section.body.map((paragraph, i) => (
						<p key={`${section.id}-${i}`} className="blog-detail-paragraph">
							{paragraph}
						</p>
					))}
				</section>
			))}
		</div>
	);
}

/* ================================================================
   RELATED POSTS
   ================================================================ */

function RelatedPosts({ currentSlug }: { currentSlug: string }) {
	const { ref, visible } = useInView(0.08);
	const handleMouse = useSpotlight();
	const related = allPosts.filter((p) => p.slug !== currentSlug).slice(0, 3);

	return (
		<section className="section-spacing-sm">
			<div className="page-container">
				<div className="mx-auto max-w-4xl">
					<h2 className="text-2xl font-semibold tracking-tight mb-8">
						Continue reading
					</h2>
					<div
						ref={ref}
						className={cn(
							"grid gap-5 md:grid-cols-3 stagger-reveal",
							visible && "is-visible",
						)}
					>
						{related.map((post) => (
							<Link
								key={post.slug}
								to={`/blog/${post.slug}`}
								onMouseMove={handleMouse}
								className="blog-card surface-panel rounded-[22px] p-3.5 group block"
							>
								<div
									className="blog-thumb"
									style={
										{
											background: (
												thumbThemes[post.category] || thumbThemes.Operations
											).bg,
										} as CSSProperties
									}
								>
									<div className="blog-thumb-inner">
										<div
											className="blog-thumb-pattern"
											style={{
												color: (
													thumbThemes[post.category] || thumbThemes.Operations
												).accent,
											}}
										/>
									</div>
									<div className="blog-thumb-overlay" />
								</div>
								<div className="relative z-10 mt-4 px-1">
									<div className="pill pill-muted text-[0.68rem]">
										{post.category}
									</div>
									<h3 className="mt-3 text-sm font-semibold leading-snug tracking-tight line-clamp-2">
										{post.title}
									</h3>
									<div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
										<time dateTime={post.isoDate}>{post.date}</time>
										<span>·</span>
										<span>{post.readingTime}</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

/* ================================================================
   MAIN PAGE
   ================================================================ */

export function BlogDetailPage() {
	const { slug } = useParams<{ slug: string }>();
	const post = allPosts.find((p) => p.slug === slug);
	const scrollViewportRef = useMarketingScrollViewport();

	const sectionIds = useMemo(
		() => (post ? post.chapters.map((ch) => ch.id) : []),
		[post],
	);
	const activeId = useActiveSection(sectionIds);

	const [readProgress, setReadProgress] = useState(0);

	useEffect(() => {
		const viewport = scrollViewportRef?.current;
		const handleScroll = () => {
			const scrollTop = viewport?.scrollTop ?? window.scrollY;
			const docHeight = viewport
				? viewport.scrollHeight - viewport.clientHeight
				: document.documentElement.scrollHeight - window.innerHeight;
			setReadProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
		};

		handleScroll();
		if (viewport) {
			viewport.addEventListener("scroll", handleScroll, { passive: true });
			return () => viewport.removeEventListener("scroll", handleScroll);
		}

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [scrollViewportRef]);

	if (!post) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="text-center">
					<h1 className="text-3xl font-semibold tracking-tight mb-4">
						Post not found
					</h1>
					<p className="text-muted-foreground mb-8">
						The article you're looking for doesn't exist.
					</p>
					<Button asChild variant="outline" className="rounded-full px-6">
						<Link to="/blog">
							<ArrowLeft className="size-4 mr-2" />
							Back to blog
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	// Find next/prev posts
	const currentIndex = allPosts.findIndex((p) => p.slug === slug);
	const prevPost =
		currentIndex > 0
			? allPosts[currentIndex - 1]
			: allPosts[allPosts.length - 1] || null;
	const nextPost =
		currentIndex < allPosts.length - 1
			? allPosts[currentIndex + 1]
			: allPosts[0] || null;

	return (
		<>
			{/* Reading progress bar */}
			<div className="blog-detail-progress-track">
				<div
					className="blog-detail-progress-bar"
					style={{ transform: `scaleX(${readProgress})` }}
				/>
			</div>

			{/* Hero Section */}
			<section className="relative overflow-hidden pt-28 pb-4 md:pt-36 md:pb-8">
				<div className="hero-gradient-orb -top-40 left-1/4 h-[500px] w-[500px] bg-[var(--brand-glow-strong)] opacity-50" />
				<div className="hero-gradient-orb -top-20 right-0 h-[400px] w-[400px] bg-[var(--brand-glow)] opacity-35" />
				<div className="hero-noise absolute inset-0 pointer-events-none" />

				<div className="page-container relative z-10">
					<div className="mx-auto max-w-6xl stagger-children">
						{/* Breadcrumb */}
						<nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
							<Link
								to="/blog"
								className="hover:text-foreground transition-colors"
							>
								Blog
							</Link>
							<ChevronRight className="size-3.5" />
							<span className="text-foreground/70 truncate max-w-[240px]">
								{post.title}
							</span>
						</nav>

						{/* Category + reading time */}
						<div className="flex flex-wrap items-center gap-3">
							<div className="pill pill-info">{post.category}</div>
							<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
								<Clock className="size-3.5" />
								{post.readingTime}
							</div>
						</div>

						{/* Title */}
						<h1 className="mt-6 text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[2.75rem] md:text-[3.25rem]">
							{post.title}
						</h1>

						{/* Excerpt */}
						<p className="mt-5 max-w-2xl text-lg leading-7 text-muted-foreground">
							{post.excerpt}
						</p>

						{/* Author + date */}
						<div className="mt-8 flex items-center gap-4">
							<div className="blog-author-ring flex size-11 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
								{post.author.initials}
							</div>
							<div>
								<div className="text-sm font-medium">{post.author.name}</div>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<span>{post.author.role}</span>
									<span>·</span>
									<time dateTime={post.isoDate}>{post.date}</time>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Hero Thumbnail */}
			<section className="pb-2">
				<div className="page-container">
					<div className="mx-auto max-w-6xl">
						<DetailHeroThumbnail category={post.category} title={post.title} />
					</div>
				</div>
			</section>

			<section className="pb-2">
				<div className="page-container">
					<div className="mx-auto max-w-6xl">
						<SidebarTLDR tldr={post.tldr} />
					</div>
				</div>
			</section>

			{/* Main content + sidebar */}
			<section className="section-spacing-sm">
				<div className="page-container">
					<div className="mx-auto max-w-6xl blog-detail-layout">
						{/* Article column */}
						<article className="blog-detail-content min-w-0">
							<ArticleBody content={post.content} />

							{/* Article footer */}
							<Separator className="my-10 bg-[var(--brand-border-soft)]" />

							{/* Tags */}
							<div className="flex flex-wrap gap-2.5 mb-10">
								{[post.category, "Tool ops", "Strategy", "Workflow"].map(
									(tag) => (
										<span
											key={tag}
											className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-border-soft)] bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground"
										>
											<Hash className="size-3" />
											{tag}
										</span>
									),
								)}
							</div>

							{/* Prev / Next navigation */}
							<div className="grid gap-4 sm:grid-cols-2">
								{prevPost ? (
									<Link
										to={`/blog/${prevPost.slug}`}
										className="blog-detail-nav-card surface-panel rounded-[20px] p-5 group"
									>
										<div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
											<ArrowLeft className="size-3" />
											Previous article
										</div>
										<h4 className="text-sm font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
											{prevPost.title}
										</h4>
									</Link>
								) : (
									<div />
								)}
								{nextPost ? (
									<Link
										to={`/blog/${nextPost.slug}`}
										className="blog-detail-nav-card surface-panel rounded-[20px] p-5 group text-right"
									>
										<div className="text-xs text-muted-foreground mb-2 flex items-center justify-end gap-1.5">
											Next article
											<ArrowRight className="size-3" />
										</div>
										<h4 className="text-sm font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
											{nextPost.title}
										</h4>
									</Link>
								) : (
									<div />
								)}
							</div>
						</article>

						{/* Sidebar */}
						<aside className="blog-detail-sidebar">
							<div className="blog-detail-sidebar-sticky">
								<SidebarShare title={post.title} slug={post.slug} />
								<SidebarAISummarize title={post.title} />
								<SidebarChapters chapters={post.chapters} activeId={activeId} />
							</div>
						</aside>
					</div>
				</div>
			</section>

			{/* Related posts */}
			<RelatedPosts currentSlug={post.slug} />

			{/* Back to blog CTA */}
			<section className="pb-20">
				<div className="page-container">
					<div className="mx-auto max-w-4xl text-center">
						<SurfaceCard
							tone="strong"
							className="relative overflow-hidden px-6 py-12 md:px-14 md:py-16"
						>
							<div className="brand-grid absolute inset-0 opacity-10" />
							<div className="hero-gradient-orb -top-24 left-1/3 h-[250px] w-[250px] bg-[var(--brand-glow-strong)] opacity-40" />

							<div className="relative z-10">
								<SectionTag className="mx-auto">
									<Sparkles className="size-3.5" />
									Keep exploring
								</SectionTag>
								<h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
									More insights from the{" "}
									<span className="text-gradient-brand">Memofi blog.</span>
								</h2>
								<p className="mt-3 text-sm text-muted-foreground md:text-base">
									Operator frameworks, product updates, and workflow lessons for
									teams that want better systems.
								</p>
								<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
									<Button
										size="lg"
										className="rounded-full bg-gradient-brand px-8 text-white border-0"
										asChild
									>
										<Link to="/blog">
											Browse all posts
											<ArrowRight className="ml-1 size-4" />
										</Link>
									</Button>
								</div>
							</div>
						</SurfaceCard>
					</div>
				</div>
			</section>
		</>
	);
}

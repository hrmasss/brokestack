import {
	ArrowRight,
	CalendarDays,
	Clock,
	Megaphone,
	Newspaper,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { Link } from "react-router";

import {
	SectionHeading,
	SectionTag,
	SurfaceCard,
} from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
   THUMBNAIL COMPONENT
   ================================================================ */

const thumbThemes: Record<
	string,
	{ bg: string; accent: string }
> = {
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

function BlogThumbnail({
	category,
	title,
	className,
	featured = false,
}: {
	category: string;
	title: string;
	className?: string;
	featured?: boolean;
}) {
	const theme = thumbThemes[category] || thumbThemes.Operations;
	return (
		<div
			className={cn(
				featured ? "blog-featured-thumb" : "blog-thumb",
				className,
			)}
			style={{ background: theme.bg } as CSSProperties}
		>
			<div
				className={featured ? "blog-featured-thumb-inner" : "blog-thumb-inner"}
			>
				{/* Dot pattern layer */}
				<div className="blog-thumb-pattern" style={{ color: theme.accent }} />

				{/* Decorative shapes */}
				<svg
					className="absolute inset-0 size-full"
					viewBox="0 0 400 225"
					fill="none"
					preserveAspectRatio="xMidYMid slice"
					aria-hidden="true"
				>
					<circle
						cx="320"
						cy="180"
						r="120"
						fill={theme.accent}
						opacity="0.07"
					/>
					<circle
						cx="80"
						cy="60"
						r="40"
						fill={theme.accent}
						opacity="0.1"
					/>
					<line
						x1="40"
						y1="170"
						x2="200"
						y2="170"
						stroke={theme.accent}
						strokeWidth="1.5"
						opacity="0.15"
					/>
					<line
						x1="40"
						y1="180"
						x2="160"
						y2="180"
						stroke={theme.accent}
						strokeWidth="1"
						opacity="0.1"
					/>
				</svg>

				{/* Category icon watermark */}
				<div
					className="absolute right-4 bottom-4 flex size-12 items-center justify-center rounded-2xl opacity-20"
					style={{ color: theme.accent }}
				>
					{category === "Operations" && <TrendingUp className="size-8" />}
					{category === "Planning" && <CalendarDays className="size-8" />}
					{category === "Approvals" && <Newspaper className="size-8" />}
					{category === "Product update" && <Megaphone className="size-8" />}
					{category === "Analytics" && <TrendingUp className="size-8" />}
					{category === "Governance" && <Newspaper className="size-8" />}
				</div>

				{/* Title preview on featured */}
				{featured && (
					<div className="absolute inset-x-6 bottom-6 z-10 hidden lg:block">
						<div
							className="max-w-xs text-lg font-semibold leading-snug tracking-tight opacity-[0.12]"
							style={{ color: theme.accent }}
						>
							{title}
						</div>
					</div>
				)}
			</div>
			<div className="blog-thumb-overlay" />
		</div>
	);
}

/* ================================================================
   DATA
   ================================================================ */

const editorialStreams = [
	{
		icon: TrendingUp,
		title: "Growth lessons",
		description:
			"Breakdowns on execution velocity, workflow patterns, and the operational habits that compound over time.",
	},
	{
		icon: Newspaper,
		title: "Operator playbooks",
		description:
			"Practical guidance for workflow checks, scheduling, reporting cadences, and multi-tool operations.",
	},
	{
		icon: Megaphone,
		title: "Product updates",
		description:
			"Notes from the roadmap on features, release decisions, and why specific workflow improvements shipped.",
	},
];

const posts = [
	{
		slug: "content-ops-scorecard",
		category: "Operations",
		title:
			"The operational scorecard high-performing tool teams actually use",
		excerpt:
			"Most teams track output and call it strategy. Better operators monitor handoff speed, failure lag, reuse rate, and run readiness together.",
		date: "March 6, 2026",
		isoDate: "2026-03-06",
		readingTime: "6 min read",
		author: { name: "Rina Morales", initials: "RM" },
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
		author: { name: "Daniel Osei", initials: "DO" },
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
		author: { name: "Priya Chandler", initials: "PC" },
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
		author: { name: "Memofi Team", initials: "MT" },
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
		author: { name: "Sophie Nakamura", initials: "SN" },
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
		author: { name: "Max Okoro", initials: "MO" },
	},
];

const featuredPost = posts[0];
const gridPosts = posts.slice(1);

/* ================================================================
   SECTION: HERO
   ================================================================ */

function HeroSection() {
	return (
		<section className="relative overflow-hidden pt-28 pb-6 md:pt-36 md:pb-10">
			{/* Decorative orbs */}
			<div className="hero-gradient-orb -top-40 left-1/4 h-[500px] w-[500px] bg-[var(--brand-glow-strong)] opacity-50" />
			<div className="hero-gradient-orb -top-20 right-0 h-[400px] w-[400px] bg-[var(--brand-glow)] opacity-35" />
			<div className="hero-noise absolute inset-0 pointer-events-none" />

			<div className="page-container relative z-10">
				<div className="mx-auto max-w-4xl text-center stagger-children">
					<SectionTag className="mx-auto">
						<Sparkles className="size-3.5" />
						Insights &amp; updates
					</SectionTag>

					<h1 className="mx-auto mt-5 max-w-[18ch] text-balance text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl md:text-6xl">
						A blog for teams who want{" "}
						<span className="text-gradient-brand">sharper operations</span>, not
						recycled advice.
					</h1>

					<p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
						Tooling lessons, operator playbooks, and product updates designed to
						help teams work with more structure and better judgment.
					</p>

					{/* Quick stats band */}
					<div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-3">
						{[
							{ label: "Weekly", detail: "New posts" },
							{ label: "Actionable", detail: "Operator frameworks" },
							{ label: "Evergreen", detail: "Searchable archive" },
						].map((stat) => (
							<div
								key={stat.label}
								className="flex items-center gap-2.5 rounded-full border border-[var(--brand-border-soft)] bg-background/60 px-4 py-2.5 text-sm backdrop-blur-sm"
							>
								<span className="font-semibold">{stat.label}</span>
								<span className="h-3 w-px bg-border" />
								<span className="text-muted-foreground">{stat.detail}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

/* ================================================================
   SECTION: FEATURED POST
   ================================================================ */

function FeaturedPostSection() {
	const { ref, visible } = useInView(0.1);
	const handleMouse = useSpotlight();

	return (
		<section className="section-spacing-sm">
			<div className="page-container">
				<div
					ref={ref}
					className={cn("stagger-reveal", visible && "is-visible")}
				>
					<Link
						to={`/blog/${featuredPost.slug}`}
						onMouseMove={handleMouse}
						className="blog-featured-card surface-panel-strong rounded-[28px] overflow-hidden block"
					>
						<div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
							{/* Thumbnail */}
							<BlogThumbnail
								category={featuredPost.category}
								title={featuredPost.title}
								featured
							/>

							{/* Content */}
							<div className="relative z-10 flex flex-col justify-between p-6 md:p-8 lg:p-10">
								<div>
									<div className="flex flex-wrap items-center gap-3 text-sm">
										<div className="pill pill-info">
											{featuredPost.category}
										</div>
										<div className="pill pill-muted">Featured</div>
									</div>

									<h2 className="mt-6 text-2xl font-semibold leading-snug tracking-tight md:text-3xl lg:text-4xl">
										{featuredPost.title}
									</h2>

									<p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
										{featuredPost.excerpt}
									</p>
								</div>

								<div className="mt-8 flex flex-wrap items-center justify-between gap-4">
									{/* Author + meta */}
									<div className="flex items-center gap-3">
										<div className="blog-author-ring flex size-9 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
											{featuredPost.author.initials}
										</div>
										<div>
											<div className="text-sm font-medium">
												{featuredPost.author.name}
											</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<time dateTime={featuredPost.isoDate}>
													{featuredPost.date}
												</time>
												<span>·</span>
												<span>{featuredPost.readingTime}</span>
											</div>
										</div>
									</div>

									<span className="blog-read-link">
										Read article
										<ArrowRight className="size-3.5" />
									</span>
								</div>
							</div>
						</div>
					</Link>
				</div>
			</div>
		</section>
	);
}

/* ================================================================
   SECTION: EDITORIAL STREAMS
   ================================================================ */

function EditorialStreamsSection() {
	const { ref, visible } = useInView(0.15);

	return (
		<section className="section-spacing-sm">
			<div className="page-container">
				<SectionHeading
					align="center"
					badge={<SectionTag className="mx-auto">Editorial focus</SectionTag>}
					title="What the blog covers"
					description="Content stays close to the work: runs, workflows, usage, governance, and product decisions."
				/>

				<div
					ref={ref}
					className={cn(
						"mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3 stagger-reveal",
						visible && "is-visible",
					)}
				>
					{editorialStreams.map((stream) => (
						<SurfaceCard key={stream.title} className="p-6 md:p-7">
							<div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
								<stream.icon className="size-5" />
							</div>
							<h3 className="text-lg font-semibold tracking-tight">
								{stream.title}
							</h3>
							<p className="mt-2.5 text-sm leading-6 text-muted-foreground">
								{stream.description}
							</p>
						</SurfaceCard>
					))}
				</div>
			</div>
		</section>
	);
}

/* ================================================================
   SECTION: POST GRID
   ================================================================ */

function PostGridSection() {
	const { ref, visible } = useInView(0.08);
	const handleMouse = useSpotlight();

	return (
		<section className="section-spacing">
			<div className="page-container">
				<SectionHeading
					align="center"
					badge={<SectionTag className="mx-auto">Latest posts</SectionTag>}
					title="A searchable archive starts with useful, specific writing."
					description="Written to attract operators who need frameworks they can apply immediately."
				/>

				<div
					ref={ref}
					className={cn(
						"mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3 stagger-reveal",
						visible && "is-visible",
					)}
				>
					{gridPosts.map((post) => (
						<Link
							to={`/blog/${post.slug}`}
							key={post.slug}
							id={post.slug}
							onMouseMove={handleMouse}
							className="blog-card surface-panel rounded-[28px] p-4 block"
						>
							{/* Thumbnail */}
							<BlogThumbnail category={post.category} title={post.title} />

							{/* Content */}
							<div className="relative z-10 mt-5 px-1.5">
								<div className="flex flex-wrap items-center gap-2.5 text-sm">
									<div className="pill pill-muted">{post.category}</div>
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
										<Clock className="size-3" />
										{post.readingTime}
									</div>
								</div>

								<h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight line-clamp-2">
									{post.title}
								</h3>

								<p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-2">
									{post.excerpt}
								</p>

								{/* Footer: author + date */}
								<div className="mt-5 flex items-center justify-between border-t border-[var(--brand-border-soft)] pt-4">
									<div className="flex items-center gap-2.5">
										<div className="blog-author-ring flex size-7 items-center justify-center rounded-full bg-gradient-brand text-[0.6rem] font-semibold text-white">
											{post.author.initials}
										</div>
										<div className="text-xs">
											<span className="font-medium">{post.author.name}</span>
											<span className="mx-1.5 text-muted-foreground">·</span>
											<time
												dateTime={post.isoDate}
												className="text-muted-foreground"
											>
												{post.date}
											</time>
										</div>
									</div>
									<span className="blog-read-link">
										Read
										<ArrowRight className="size-3" />
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}

/* ================================================================
   SECTION: CTA
   ================================================================ */

function CTASection() {
	return (
		<section className="section-spacing">
			<div className="page-container">
				<SurfaceCard
					tone="strong"
					className="relative overflow-hidden px-6 py-14 md:px-16 md:py-20"
				>
					<div className="brand-grid absolute inset-0 opacity-12" />
					<div className="hero-gradient-orb -top-32 left-1/3 h-[300px] w-[300px] bg-[var(--brand-glow-strong)] opacity-40" />
					<div className="hero-gradient-orb -bottom-32 right-1/4 h-[250px] w-[250px] bg-[var(--brand-glow)] opacity-30" />

					<div className="relative z-10 mx-auto max-w-2xl text-center">
						<SectionTag className="mx-auto">
							<Sparkles className="size-3.5" />
							Keep reading
						</SectionTag>

						<h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
							Follow the product and the practice,{" "}
							<span className="text-gradient-brand">
								not just the headlines.
							</span>
						</h2>

						<p className="mt-5 text-muted-foreground md:text-lg">
							Explore the platform, subscribe for updates, and see how the
							thinking from the blog shows up inside the product surface.
						</p>

						<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button
								size="lg"
								className="rounded-full bg-gradient-brand px-8 text-white border-0"
								asChild
							>
								<Link to="/signup">
									Subscribe and start
									<ArrowRight className="ml-1 size-4" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="rounded-full px-8"
								asChild
							>
								<Link to="/features">Explore product features</Link>
							</Button>
						</div>

						<p className="mt-5 text-sm text-muted-foreground">
							Generous free tier · No credit card · Upgrade when you need more
						</p>
					</div>
				</SurfaceCard>
			</div>
		</section>
	);
}

/* ================================================================
   PAGE EXPORT
   ================================================================ */

export function BlogPage() {
	return (
		<>
			<HeroSection />
			<FeaturedPostSection />
			<EditorialStreamsSection />
			<PostGridSection />
			<CTASection />
		</>
	);
}

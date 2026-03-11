import {
	Check,
	CheckCircle2,
	DollarSign,
	Edit2,
	Eye,
	EyeOff,
	Plus,
	Sparkles,
	Tag,
	Trash2,
	TrendingUp,
	Users,
} from "lucide-react";
import { useState } from "react";

import { SurfaceCard } from "@/components/app/brand";
import {
	DashboardPageHeader,
	InsightCard,
} from "@/components/app/dashboard";
import { DataTable, type DataTableColumn } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type PricingPlanRecord = {
	id: string;
	name: string;
	description: string;
	monthlyPrice: number;
	yearlyPrice: number;
	status: "active" | "deprecated";
	isPopular: boolean;
	subscribers: number;
	features: string[];
	limits: {
		users: number | "Unlimited";
		runs: number | "Unlimited";
		storage: string;
		apiCalls: string;
	};
};

const pricingPlans: PricingPlanRecord[] = [
	{
		id: "plan_1",
		name: "Starter",
		description: "For individuals and small teams getting started",
		monthlyPrice: 0,
		yearlyPrice: 0,
		status: "active",
		isPopular: false,
		subscribers: 1247,
		features: [
			"Up to 5 team members",
			"500 runs per month",
			"Basic usage insights",
			"Email support",
			"1GB storage",
		],
		limits: {
			users: 5,
			runs: 500,
			storage: "1GB",
			apiCalls: "10K/mo",
		},
	},
	{
		id: "plan_2",
		name: "Pro",
		description: "For growing teams that need more power",
		monthlyPrice: 19,
		yearlyPrice: 190,
		status: "active",
		isPopular: true,
		subscribers: 1892,
		features: [
			"Up to 25 team members",
			"10,000 runs per month",
			"Advanced usage insights",
			"Priority support",
			"10GB storage",
			"Custom workflows",
			"API access",
		],
		limits: {
			users: 25,
			runs: 10000,
			storage: "10GB",
			apiCalls: "100K/mo",
		},
	},
	{
		id: "plan_3",
		name: "Enterprise",
		description: "For large organizations with custom needs",
		monthlyPrice: 149,
		yearlyPrice: 1490,
		status: "active",
		isPopular: false,
		subscribers: 282,
		features: [
			"Unlimited team members",
			"Unlimited runs",
			"Real-time usage analytics",
			"24/7 dedicated support",
			"Unlimited storage",
			"Custom integrations",
			"SSO & SAML",
			"SLA guarantee",
			"Custom contracts",
		],
		limits: {
			users: "Unlimited",
			runs: "Unlimited",
			storage: "Unlimited",
			apiCalls: "Unlimited",
		},
	},
	{
		id: "plan_4",
		name: "Legacy Pro",
		description: "Deprecated plan - migrating users to new Pro",
		monthlyPrice: 9,
		yearlyPrice: 90,
		status: "deprecated",
		isPopular: false,
		subscribers: 89,
		features: [
			"Up to 15 team members",
			"2,500 runs per month",
			"Standard usage analytics",
			"Email support",
			"5GB storage",
		],
		limits: {
			users: 15,
			runs: 2500,
			storage: "5GB",
			apiCalls: "50K/mo",
		},
	},
];

const metrics = [
	{
		title: "Active Plans",
		value: "3",
		detail: "Currently offered",
		icon: Tag,
	},
	{
		title: "Total Subscribers",
		value: "3,510",
		detail: "Across all plans",
		delta: "+142 this month",
		icon: Users,
		tone: "success" as const,
	},
	{
		title: "Avg Revenue/User",
		value: "$84.50",
		detail: "ARPU metric",
		delta: "+$3.20 vs last month",
		icon: DollarSign,
		tone: "success" as const,
	},
	{
		title: "Most Popular",
		value: "Pro",
		detail: "54% of subscribers",
		icon: TrendingUp,
	},
];

function PlanStatusBadge({ plan }: { plan: PricingPlanRecord }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-full",
				plan.status === "active"
					? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
					: "border-gray-500/20 bg-gray-500/10 text-gray-600",
			)}
		>
			<CheckCircle2 className="mr-1 size-3" />
			{plan.status === "active" ? "Active" : "Deprecated"}
		</Badge>
	);
}

export function AdminPricingPlans() {
	const [showYearly, setShowYearly] = useState(false);

	const columns: DataTableColumn<PricingPlanRecord>[] = [
		{
			id: "plan",
			label: "Plan",
			width: 260,
			minWidth: 220,
			accessor: (plan) => (
				<div>
					<div className="flex items-center gap-2">
						<div className="font-medium">{plan.name}</div>
						{plan.isPopular ? (
							<Badge className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
								<Sparkles className="mr-1 size-3" />
								Popular
							</Badge>
						) : null}
					</div>
					<div className="mt-1 text-sm text-muted-foreground">{plan.description}</div>
				</div>
			),
			getSortValue: (plan) => plan.name,
		},
		{
			id: "price",
			label: showYearly ? "Yearly price" : "Monthly price",
			width: 150,
			accessor: (plan) => `$${showYearly ? plan.yearlyPrice : plan.monthlyPrice}`,
			getSortValue: (plan) => (showYearly ? plan.yearlyPrice : plan.monthlyPrice),
		},
		{
			id: "subscribers",
			label: "Subscribers",
			width: 140,
			accessor: (plan) => plan.subscribers.toLocaleString(),
			getSortValue: (plan) => plan.subscribers,
		},
		{
			id: "status",
			label: "Status",
			width: 160,
			accessor: (plan) => <PlanStatusBadge plan={plan} />,
			getSortValue: (plan) => plan.status,
		},
		{
			id: "limits",
			label: "Limits",
			width: 210,
			accessor: (plan) => (
				<div className="text-sm">
					<div>{plan.limits.users} users</div>
					<div className="mt-1 text-muted-foreground">
						{plan.limits.storage} storage • {plan.limits.apiCalls}
					</div>
				</div>
			),
			getSortValue: (plan) => String(plan.limits.users),
		},
	];

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Revenue Management"
				title="Pricing Plans"
				description="Manage offer packaging with the shared admin table controls, then flip between structured pricing rows and merchandising cards."
				actions={
					<>
						<div className="flex items-center gap-2 rounded-full border border-[var(--brand-border-soft)] bg-background/75 px-4 py-2">
							<span className="text-sm text-muted-foreground">Monthly</span>
							<Switch checked={showYearly} onCheckedChange={setShowYearly} />
							<span className="text-sm text-muted-foreground">Yearly</span>
						</div>
						<Dialog>
							<DialogTrigger asChild>
								<Button className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
									<Plus className="size-4" />
									New plan
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[500px]">
								<DialogHeader>
									<DialogTitle>Create Pricing Plan</DialogTitle>
									<DialogDescription>
										Define a new pricing tier with features and limits.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label htmlFor="plan-name">Plan name</Label>
										<Input
											id="plan-name"
											placeholder="e.g., Business"
											className="rounded-xl"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="plan-description">Description</Label>
										<Input
											id="plan-description"
											placeholder="Brief description of the plan"
											className="rounded-xl"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="grid gap-2">
											<Label htmlFor="monthly-price">Monthly price ($)</Label>
											<Input
												id="monthly-price"
												type="number"
												placeholder="99"
												className="rounded-xl"
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="yearly-price">Yearly price ($)</Label>
											<Input
												id="yearly-price"
												type="number"
												placeholder="990"
												className="rounded-xl"
											/>
										</div>
									</div>
									<div className="flex items-center justify-between rounded-xl border border-[var(--brand-border-soft)] p-3">
										<div>
											<div className="font-medium">Mark as popular</div>
											<div className="text-sm text-muted-foreground">
												Highlight this plan on the pricing page
											</div>
										</div>
										<Switch />
									</div>
								</div>
								<DialogFooter>
									<Button variant="outline" className="rounded-full">
										Cancel
									</Button>
									<Button className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
										Create plan
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{metrics.map((metric) => (
					<InsightCard
						key={metric.title}
						title={metric.title}
						value={metric.value}
						detail={metric.detail}
						delta={metric.delta}
						icon={metric.icon}
						tone={metric.tone}
					/>
				))}
			</div>

			<SurfaceCard className="p-5 md:p-6">
				<DataTable
					title="Plan catalog"
					description="Search plans, compare price and adoption, and move between operator list mode and storefront-style plan cards."
					rows={pricingPlans}
					columns={columns}
					getRowId={(plan) => plan.id}
					getSearchText={(plan) =>
						[
							plan.name,
							plan.description,
							plan.status,
							plan.features.join(" "),
							String(plan.limits.users),
							String(plan.limits.runs),
							plan.limits.storage,
							plan.limits.apiCalls,
						].join(" ")
					}
					searchPlaceholder="Search plans, features, or limits..."
					initialView="grid"
					gridClassName="md:grid-cols-2 xl:grid-cols-4"
					filters={[
						{
							id: "status",
							label: "Status",
							options: [
								{ label: "Active", value: "active" },
								{ label: "Deprecated", value: "deprecated" },
							],
							getValue: (plan) => plan.status,
						},
						{
							id: "popular",
							label: "Spotlight",
							options: [
								{ label: "Popular", value: "popular" },
								{ label: "Standard", value: "standard" },
							],
							getValue: (plan) => (plan.isPopular ? "popular" : "standard"),
						},
					]}
					globalActions={[
						{ label: showYearly ? "Yearly view" : "Monthly view", icon: DollarSign, variant: "outline" },
						{ label: "Pricing preview", icon: Eye, variant: "ghost" },
					]}
					rowActions={[
						{ label: "Edit plan", icon: Edit2 },
						{ label: "Preview", icon: Eye },
						{ label: "Toggle status", icon: EyeOff },
						{ label: "Delete plan", icon: Trash2, destructive: true },
					]}
					emptyState={{
						title: "No pricing plans match the current view",
						description:
							"Adjust the search query or filters to bring the right offer back into focus.",
					}}
					renderGridCard={(plan) => (
						<div
							className={cn(
								"relative flex h-full flex-col",
								plan.status === "deprecated" && "opacity-70",
							)}
						>
							{plan.isPopular ? (
								<div className="mb-4 w-fit">
									<Badge className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
										<Sparkles className="mr-1 size-3" />
										Most Popular
									</Badge>
								</div>
							) : null}

							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="text-lg font-semibold">{plan.name}</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										{plan.description}
									</p>
								</div>
								<PlanStatusBadge plan={plan} />
							</div>

							<div className="mt-4 flex items-baseline gap-1">
								<span className="text-3xl font-bold">
									${showYearly ? plan.yearlyPrice : plan.monthlyPrice}
								</span>
								<span className="text-muted-foreground">
									/{showYearly ? "year" : "month"}
								</span>
							</div>

							<div className="mt-2 text-sm text-muted-foreground">
								{plan.subscribers.toLocaleString()} subscribers
							</div>

							<div className="mt-4 flex-1">
								<div className="text-sm font-medium">Features</div>
								<ul className="mt-2 space-y-1.5">
									{plan.features.slice(0, 5).map((feature) => (
										<li
											key={feature}
											className="flex items-start gap-2 text-sm text-muted-foreground"
										>
											<Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
											<span>{feature}</span>
										</li>
									))}
									{plan.features.length > 5 ? (
										<li className="pl-6 text-sm text-muted-foreground">
											+{plan.features.length - 5} more features
										</li>
									) : null}
								</ul>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-[var(--brand-border-soft)] p-3">
								<div>
									<div className="text-xs text-muted-foreground">Users</div>
									<div className="text-sm font-medium">{plan.limits.users}</div>
								</div>
								<div>
									<div className="text-xs text-muted-foreground">Runs</div>
									<div className="text-sm font-medium">{plan.limits.runs}</div>
								</div>
								<div>
									<div className="text-xs text-muted-foreground">Storage</div>
									<div className="text-sm font-medium">{plan.limits.storage}</div>
								</div>
								<div>
									<div className="text-xs text-muted-foreground">API Calls</div>
									<div className="text-sm font-medium">{plan.limits.apiCalls}</div>
								</div>
							</div>
						</div>
					)}
				/>
			</SurfaceCard>
		</div>
	);
}

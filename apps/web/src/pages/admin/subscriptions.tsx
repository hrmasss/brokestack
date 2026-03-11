import {
	AlertCircle,
	ArrowUpRight,
	Calendar,
	CheckCircle2,
	CreditCard,
	DollarSign,
	Download,
	MoreHorizontal,
	Pause,
	Play,
	RefreshCw,
	XCircle,
} from "lucide-react";

import { SurfaceCard } from "@/components/app/brand";
import {
	DashboardPageHeader,
	InsightCard,
} from "@/components/app/dashboard";
import { DataTable, type DataTableColumn } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubscriptionRecord = {
	id: string;
	customer: string;
	email: string;
	plan: "Starter" | "Pro" | "Enterprise";
	amount: string;
	amountSort: number;
	status: "active" | "past_due" | "cancelled" | "paused";
	billingCycle: "Monthly" | "Annual";
	nextBilling: string;
	nextBillingSort: number;
	startDate: string;
};

const subscriptions: SubscriptionRecord[] = [
	{
		id: "sub_1",
		customer: "Acme Corporation",
		email: "billing@acme.co",
		plan: "Enterprise",
		amount: "$499/mo",
		amountSort: 499,
		status: "active",
		billingCycle: "Monthly",
		nextBilling: "Mar 15, 2026",
		nextBillingSort: 20260315,
		startDate: "Jan 15, 2025",
	},
	{
		id: "sub_2",
		customer: "TechStart Inc",
		email: "accounts@techstart.io",
		plan: "Pro",
		amount: "$79/mo",
		amountSort: 79,
		status: "active",
		billingCycle: "Monthly",
		nextBilling: "Mar 22, 2026",
		nextBillingSort: 20260322,
		startDate: "Feb 22, 2026",
	},
	{
		id: "sub_3",
		customer: "Design Studio Co",
		email: "finance@designstudio.com",
		plan: "Starter",
		amount: "$29/mo",
		amountSort: 29,
		status: "past_due",
		billingCycle: "Monthly",
		nextBilling: "Mar 1, 2026",
		nextBillingSort: 20260301,
		startDate: "Dec 1, 2025",
	},
	{
		id: "sub_4",
		customer: "Global Enterprises",
		email: "ap@globalent.com",
		plan: "Enterprise",
		amount: "$4,999/yr",
		amountSort: 4999,
		status: "active",
		billingCycle: "Annual",
		nextBilling: "Sep 1, 2026",
		nextBillingSort: 20260901,
		startDate: "Sep 1, 2025",
	},
	{
		id: "sub_5",
		customer: "Freelance Pro",
		email: "john@freelancepro.dev",
		plan: "Pro",
		amount: "$79/mo",
		amountSort: 79,
		status: "cancelled",
		billingCycle: "Monthly",
		nextBilling: "N/A",
		nextBillingSort: 99999999,
		startDate: "Nov 10, 2025",
	},
	{
		id: "sub_6",
		customer: "Startup Labs",
		email: "team@startuplabs.io",
		plan: "Pro",
		amount: "$79/mo",
		amountSort: 79,
		status: "paused",
		billingCycle: "Monthly",
		nextBilling: "On resume",
		nextBillingSort: 99999998,
		startDate: "Oct 5, 2025",
	},
];

const statusConfig = {
	active: {
		label: "Active",
		icon: CheckCircle2,
		className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
	},
	past_due: {
		label: "Past Due",
		icon: AlertCircle,
		className: "bg-red-500/10 text-red-600 border-red-500/20",
	},
	cancelled: {
		label: "Cancelled",
		icon: XCircle,
		className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
	},
	paused: {
		label: "Paused",
		icon: Pause,
		className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
	},
} satisfies Record<
	SubscriptionRecord["status"],
	{ label: string; icon: typeof CheckCircle2; className: string }
>;

const metrics = [
	{
		title: "Monthly Recurring",
		value: "$284,592",
		detail: "MRR across all plans",
		delta: "+$18.4K this month",
		icon: DollarSign,
		tone: "success" as const,
	},
	{
		title: "Active Subscriptions",
		value: "3,421",
		detail: "Paying customers",
		icon: CreditCard,
	},
	{
		title: "Churn Rate",
		value: "2.3%",
		detail: "Last 30 days",
		delta: "-0.4% improvement",
		icon: RefreshCw,
		tone: "success" as const,
	},
	{
		title: "Past Due",
		value: "47",
		detail: "Requires attention",
		icon: AlertCircle,
		tone: "warning" as const,
	},
];

function StatusBadge({
	status,
}: {
	status: SubscriptionRecord["status"];
}) {
	const config = statusConfig[status];

	return (
		<Badge variant="outline" className={cn("gap-1 rounded-full", config.className)}>
			<config.icon className="size-3" />
			{config.label}
		</Badge>
	);
}

const columns: DataTableColumn<SubscriptionRecord>[] = [
	{
		id: "customer",
		label: "Customer",
		width: 280,
		minWidth: 240,
		accessor: (sub) => (
			<div>
				<div className="font-medium">{sub.customer}</div>
				<div className="mt-1 text-sm text-muted-foreground">{sub.email}</div>
			</div>
		),
		getSortValue: (sub) => sub.customer,
	},
	{
		id: "plan",
		label: "Plan",
		width: 160,
		accessor: (sub) => (
			<div>
				<div className="font-medium">{sub.plan}</div>
				<div className="mt-1 text-sm text-muted-foreground">{sub.billingCycle}</div>
			</div>
		),
		getSortValue: (sub) => `${sub.plan}-${sub.billingCycle}`,
	},
	{
		id: "amount",
		label: "Amount",
		width: 130,
		accessor: (sub) => sub.amount,
		getSortValue: (sub) => sub.amountSort,
	},
	{
		id: "status",
		label: "Status",
		width: 150,
		accessor: (sub) => <StatusBadge status={sub.status} />,
		getSortValue: (sub) => sub.status,
	},
	{
		id: "nextBilling",
		label: "Next billing",
		width: 160,
		accessor: (sub) => (
			<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
				<Calendar className="size-3.5" />
				{sub.nextBilling}
			</div>
		),
		getSortValue: (sub) => sub.nextBillingSort,
	},
	{
		id: "startDate",
		label: "Started",
		width: 150,
		accessor: (sub) => sub.startDate,
		getSortValue: (sub) => sub.startDate,
	},
];

export function AdminSubscriptions() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Billing Management"
				title="Subscriptions"
				description="Track billing health, segment plan mix, and intervene on paused or past-due accounts without leaving the queue."
				actions={
					<Button variant="outline" className="rounded-full">
						<Download className="size-4" />
						Export CSV
					</Button>
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
					title="Subscription ledger"
					description="Filter by status or plan, sort commercial risk, and switch between billing list and customer cards."
					rows={subscriptions}
					columns={columns}
					getRowId={(sub) => sub.id}
					getSearchText={(sub) =>
						[
							sub.customer,
							sub.email,
							sub.plan,
							sub.status,
							sub.billingCycle,
							sub.nextBilling,
						].join(" ")
					}
					searchPlaceholder="Search customers, plans, or billing contacts..."
					filters={[
						{
							id: "status",
							label: "Status",
							options: Object.entries(statusConfig).map(([value, config]) => ({
								label: config.label,
								value,
							})),
							getValue: (sub) => sub.status,
						},
						{
							id: "plan",
							label: "Plan",
							options: ["Starter", "Pro", "Enterprise"].map((value) => ({
								label: value,
								value,
							})),
							getValue: (sub) => sub.plan,
						},
						{
							id: "billingCycle",
							label: "Billing",
							options: ["Monthly", "Annual"].map((value) => ({
								label: value,
								value,
							})),
							getValue: (sub) => sub.billingCycle,
						},
					]}
					globalActions={[
						{ label: "Retry billing", icon: RefreshCw, variant: "outline" },
						{ label: "Review accounts", icon: ArrowUpRight, variant: "ghost" },
					]}
					rowActions={[
						{ label: "View details", icon: ArrowUpRight },
						{ label: "Update payment", icon: CreditCard },
						{ label: "Pause or resume", icon: Play },
						{ label: "Cancel subscription", icon: XCircle, destructive: true },
					]}
					emptyState={{
						title: "No subscriptions match the current view",
						description:
							"Adjust search terms or filters to bring the right billing accounts back into focus.",
					}}
					renderGridCard={(sub) => (
						<div className="space-y-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="text-lg font-medium">{sub.customer}</div>
									<div className="mt-1 text-sm text-muted-foreground">{sub.email}</div>
								</div>
								<StatusBadge status={sub.status} />
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="outline" className="rounded-full">
									{sub.plan}
								</Badge>
								<Badge variant="outline" className="rounded-full">
									{sub.billingCycle}
								</Badge>
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Amount
									</div>
									<div className="mt-1 font-medium">{sub.amount}</div>
								</div>
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Started
									</div>
									<div className="mt-1">{sub.startDate}</div>
								</div>
							</div>
							<div className="flex items-center justify-between rounded-2xl border border-[var(--brand-border-soft)] bg-background/70 px-4 py-3 text-sm">
								<div className="flex items-center gap-2">
									<Calendar className="size-4 text-muted-foreground" />
									<span>{sub.nextBilling}</span>
								</div>
								<Button variant="ghost" size="icon-sm">
									<MoreHorizontal className="size-4" />
								</Button>
							</div>
						</div>
					)}
				/>
			</SurfaceCard>
		</div>
	);
}

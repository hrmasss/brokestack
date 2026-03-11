import { CalendarRange, CheckCircle2, Clock3, Plus } from "lucide-react";
import { Link } from "react-router";

import {
	DashboardPageHeader,
	DashboardPanel,
} from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";

const columns = [
	{
		label: "Mon 10",
		items: [
			{ title: "Founder memo thread", time: "09:30", state: "Ready" },
			{ title: "Retail teaser reel", time: "13:00", state: "Review" },
		],
	},
	{
		label: "Tue 11",
		items: [
			{ title: "Benchmark carousel", time: "10:00", state: "Draft" },
			{ title: "Partner announcement", time: "15:30", state: "Ready" },
		],
	},
	{
		label: "Wed 12",
		items: [
			{ title: "Regional launch edits", time: "11:15", state: "Blocked" },
			{ title: "AMA prompt sequence", time: "16:00", state: "Ready" },
		],
	},
];

export function DashboardCalendar() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Schedule"
				title="Calendar"
				description="A launch-oriented calendar view that keeps sequencing, owners, and status visible at a glance."
				actions={
					<Button
						className="rounded-full bg-gradient-brand text-white border-0"
						asChild
					>
						<Link to="/dashboard/posts/new">
							<Plus className="size-4" />
							Add launch item
						</Link>
					</Button>
				}
			/>

			<DashboardPanel
				title="This week"
				description="Marketing and dashboard now share the same panel rhythm, muted contrast, and rust accents."
			>
				<div className="grid gap-4 xl:grid-cols-3">
					{columns.map((column) => (
						<SurfaceCard key={column.label} tone="muted" className="p-5">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<CalendarRange className="size-4" />
								</div>
								<div className="font-medium">{column.label}</div>
							</div>
							<div className="mt-5 space-y-3">
								{column.items.map((item) => (
									<div
										key={item.title}
										className="rounded-[22px] border border-[var(--brand-border-soft)] bg-background/70 p-4"
									>
										<div className="flex items-center justify-between gap-3">
											<div className="text-sm font-medium">{item.title}</div>
											<span
												className={
													item.state === "Ready"
														? "pill pill-success"
														: item.state === "Review"
															? "pill pill-warning"
															: item.state === "Draft"
																? "pill pill-muted"
																: "pill pill-error"
												}
											>
												{item.state}
											</span>
										</div>
										<div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
											<Clock3 className="size-4" />
											{item.time}
										</div>
									</div>
								))}
							</div>
						</SurfaceCard>
					))}
				</div>
			</DashboardPanel>

			<DashboardPanel
				title="Calendar health"
				description="Operational detail stays visible even in the broader planning view."
			>
				<div className="grid gap-4 md:grid-cols-3">
					{[
						["91%", "Slots have owners assigned"],
						["4", "Items waiting on review"],
						["2", "Blocked assets across the week"],
					].map((item) => (
						<SurfaceCard key={item[1]} className="p-5">
							<div className="text-3xl font-semibold tracking-tight">
								{item[0]}
							</div>
							<div className="mt-2 text-sm text-muted-foreground">
								{item[1]}
							</div>
						</SurfaceCard>
					))}
				</div>
				<div className="mt-4 rounded-[24px] border border-[var(--brand-border-soft)] bg-background/70 p-4 text-sm text-muted-foreground">
					<CheckCircle2 className="mr-2 inline size-4 text-[var(--brand-success)]" />
					Approval reminders and asset checks run automatically against the same
					schedule model.
				</div>
			</DashboardPanel>
		</div>
	);
}

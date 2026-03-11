import type { ReactNode } from "react";

import { SurfaceCard } from "@/components/app/brand";
import { DashboardPageHeader } from "@/components/app/dashboard";
import { cn } from "@/lib/utils";

export function AdminFormPage({
	eyebrow,
	title,
	description,
	actions,
	aside,
	children,
}: {
	eyebrow: string;
	title: string;
	description: string;
	actions?: ReactNode;
	aside?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow={eyebrow}
				title={title}
				description={description}
				actions={actions}
			/>
			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
				<div className="space-y-6">{children}</div>
				{aside ? <div className="space-y-6">{aside}</div> : null}
			</div>
		</div>
	);
}

export function AdminFormSection({
	title,
	description,
	children,
	className,
}: {
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<SurfaceCard className={cn("p-5 md:p-6", className)}>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold tracking-tight">{title}</h2>
				{description ? (
					<p className="text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>
			<div className="mt-5">{children}</div>
		</SurfaceCard>
	);
}

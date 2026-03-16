import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";

import { DashboardPageHeader, DashboardPanel } from "@/components/app/dashboard";
import { Button } from "@/components/ui/button";
import { resolveApiBase } from "@/pages/dashboard/images-shared";

const apiBase = resolveApiBase();

export function DashboardApiDocs() {
	const navigate = useNavigate();
	const docsUrl = `${apiBase}/reference`;

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Workspace API"
				title="API docs"
				description="The existing Scalar reference is embedded here so workspace users can generate keys and read the docs without leaving the dashboard."
				actions={
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							className="rounded-full"
							onClick={() => navigate("/dashboard/api")}
						>
							<ArrowLeft className="size-4" />
							Back to API
						</Button>
						<a href={docsUrl} target="_blank" rel="noreferrer" className="inline-flex">
							<Button variant="outline" className="rounded-full">
								<ExternalLink className="size-4" />
								Open standalone
							</Button>
						</a>
					</div>
				}
			/>

			<DashboardPanel
				title="Reference"
				description="Scalar is kept in place for now so we can ship the new API workflow without waiting on a docs-platform swap."
			>
				<div className="overflow-hidden rounded-[28px] border border-[var(--brand-border-soft)] bg-background/80">
					<iframe
						title="BrokeStack API reference"
						src={docsUrl}
						className="h-[78vh] w-full border-0 bg-background"
					/>
				</div>
			</DashboardPanel>
		</div>
	);
}

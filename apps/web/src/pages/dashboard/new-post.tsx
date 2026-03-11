import { CalendarRange, FilePlus2, ImageIcon, Sparkles } from "lucide-react";

import {
	DashboardPageHeader,
	DashboardPanel,
} from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function DashboardNewPost() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Launch"
				title="Launch run"
				description="A lightweight launch page for kicking off a tool run without leaving the workspace."
			/>

			<DashboardPanel
				title="Run details"
				description="Minimal structure, but enough context to feel intentional."
			>
				<div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
					<SurfaceCard tone="muted" className="space-y-4 p-5">
						<label className="block space-y-2">
							<span className="text-sm font-medium">Tool name</span>
							<Input
								className="h-11 rounded-2xl"
								placeholder="PNG to SVG batch"
							/>
						</label>
						<label className="block space-y-2">
							<span className="text-sm font-medium">Run mode</span>
							<Input className="h-11 rounded-2xl" placeholder="Workspace UI" />
						</label>
						<label className="block space-y-2">
							<span className="text-sm font-medium">Instructions</span>
							<Textarea
								className="min-h-40 rounded-[24px]"
								placeholder="Describe the inputs, output format, and any constraints for this run..."
							/>
						</label>
						<div className="flex flex-wrap gap-2">
							<Button className="rounded-full bg-gradient-brand text-white border-0">
								<FilePlus2 className="size-4" />
								Start run
							</Button>
							<Button variant="outline" className="rounded-full">
								<Sparkles className="size-4" />
								Suggest inputs
							</Button>
						</div>
					</SurfaceCard>

					<div className="space-y-4">
						<SurfaceCard tone="muted" className="p-5">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<CalendarRange className="size-4" />
								</div>
								<div>
									<div className="font-medium">Scheduling</div>
									<div className="text-sm text-muted-foreground">
										Run now or queue for the next worker window
									</div>
								</div>
							</div>
						</SurfaceCard>

						<SurfaceCard tone="muted" className="p-5">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<ImageIcon className="size-4" />
								</div>
								<div>
									<div className="font-medium">Inputs</div>
									<div className="text-sm text-muted-foreground">
										Attach files, prompts, URLs, or API parameters
									</div>
								</div>
							</div>
						</SurfaceCard>
					</div>
				</div>
			</DashboardPanel>
		</div>
	);
}

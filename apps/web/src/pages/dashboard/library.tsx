import {
	FileCode2,
	FolderKanban,
	ImageIcon,
	Search,
	WandSparkles,
} from "lucide-react";

import {
	DashboardPageHeader,
	DashboardPanel,
} from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Input } from "@/components/ui/input";

const assets = [
	{
		name: "Logo generator prompt pack",
		type: "Prompt",
		size: "12 variants",
		tag: "Image",
	},
	{
		name: "PNG to SVG output bundle",
		type: "Output",
		size: "18 files",
		tag: "Conversion",
	},
	{
		name: "Domain sweep shortlist",
		type: "Dataset",
		size: "41 results",
		tag: "Domains",
	},
	{
		name: "Browser session recipe",
		type: "Template",
		size: "v3.2",
		tag: "Automation",
	},
];

export function DashboardLibrary() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Artifacts"
				title="Artifacts"
				description="A calmer, richer artifact surface that stays visually aligned with the rest of the product."
			/>

			<DashboardPanel
				title="Browse artifacts"
				description="The artifact view uses the same border radius, panel treatment, and typography cadence as the rest of the workspace."
				action={
					<div className="relative w-full sm:w-72">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							className="h-10 rounded-full pl-10"
							placeholder="Search artifacts"
						/>
					</div>
				}
			>
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{assets.map((asset) => (
						<SurfaceCard key={asset.name} className="overflow-hidden">
							<div className="flex aspect-[4/3] items-center justify-center bg-[linear-gradient(145deg,var(--brand-highlight),transparent)]">
								{asset.type === "Prompt" ? (
									<WandSparkles className="size-10 text-primary" />
								) : asset.type === "Template" ? (
									<FileCode2 className="size-10 text-primary" />
								) : (
									<ImageIcon className="size-10 text-primary" />
								)}
							</div>
							<div className="p-5">
								<div className="text-lg font-medium">{asset.name}</div>
								<div className="mt-2 text-sm text-muted-foreground">
									{asset.size}
								</div>
								<div className="mt-4 flex items-center justify-between">
									<span className="pill pill-muted">{asset.tag}</span>
									<span className="text-sm text-muted-foreground">
										{asset.type}
									</span>
								</div>
							</div>
						</SurfaceCard>
					))}
				</div>
			</DashboardPanel>

			<SurfaceCard tone="muted" className="p-5">
				<div className="flex items-start gap-3">
					<div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
						<FolderKanban className="size-5" />
					</div>
					<div>
						<div className="font-medium">Shared artifact rules</div>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Artifacts inherit naming, retention, and workspace permission
							rules. That keeps useful outputs easy to find instead of letting
							the library turn into a file graveyard.
						</p>
					</div>
				</div>
			</SurfaceCard>
		</div>
	);
}

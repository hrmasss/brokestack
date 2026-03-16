import { ArrowLeft, Download, ExternalLink, ImageIcon, LoaderCircle } from "lucide-react";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { DashboardPageHeader, DashboardPanel } from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { useAuth } from "@/lib/auth-context";
import type { ApiListResponse, ImageJob, ImageOutput } from "@/lib/api-types";
import {
	activeImageJobStates,
	formatDashboardDate,
	imageJobStatusStyles,
	resolveApiBase,
} from "@/pages/dashboard/images-shared";

const apiBase = resolveApiBase();

export function DashboardImageDetail() {
	const navigate = useNavigate();
	const { id } = useParams();
	const { customerRequest } = useAuth();
	const [job, setJob] = useState<ImageJob | null>(null);
	const [outputs, setOutputs] = useState<ImageOutput[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [outputUrls, setOutputUrls] = useState<Record<string, string>>({});
	const outputUrlsRef = useRef<Record<string, string>>({});

	const loadDetail = useEffectEvent(async () => {
		if (!id) {
			return;
		}
		setLoading(true);
		setError(null);
		void Promise.all([
			customerRequest<ImageJob>(`/image-jobs/${id}`, { workspaceId: null }),
			customerRequest<ApiListResponse<ImageOutput>>(`/image-jobs/${id}/outputs`, {
				workspaceId: null,
			}),
		])
			.then(([jobResponse, outputResponse]) => {
				setJob(jobResponse);
				setOutputs(outputResponse.items);
			})
			.catch((loadError) => {
				setError(
					loadError instanceof Error
						? loadError.message
						: "Unable to load the image job.",
				);
			})
			.finally(() => setLoading(false));
	});

	useEffect(() => {
		void loadDetail();
	}, [customerRequest, id]);

	useEffect(() => {
		if (!job || !activeImageJobStates.has(job.status)) {
			return;
		}
		const interval = window.setInterval(() => {
			void loadDetail();
		}, 3000);
		return () => window.clearInterval(interval);
	}, [job?.status]);

	useEffect(() => {
		outputs.forEach((output) => {
			const targetUrl = output.contentUrl.startsWith("http")
				? output.contentUrl
				: `${apiBase}${output.contentUrl}`;
			setOutputUrls((current) => ({ ...current, [output.id]: targetUrl }));
			outputUrlsRef.current[output.id] = targetUrl;
		});
		return () => {
			Object.values(outputUrlsRef.current).forEach((url) => {
				if (url.startsWith("blob:")) {
					URL.revokeObjectURL(url);
				}
			});
		};
	}, [outputs]);

	const pageTitle = useMemo(
		() => job?.title || "Image detail",
		[job],
	);

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Image detail"
				title={pageTitle}
				description="Inspect the source, batch context, provider thread, and downloaded outputs for a single image job."
				actions={
					<Button
						variant="outline"
						className="rounded-full"
						onClick={() => navigate("/dashboard/images")}
					>
						<ArrowLeft className="size-4" />
						Back to images
					</Button>
				}
			/>

			{error ? (
				<SurfaceCard tone="muted" className="p-5 text-sm text-destructive">
					{error}
				</SurfaceCard>
			) : null}

			{loading ? (
				<SurfaceCard tone="muted" className="flex items-center justify-center p-10">
					<LoaderCircle className="size-5 animate-spin text-muted-foreground" />
				</SurfaceCard>
			) : job ? (
				<>
					<div className="grid gap-6 xl:grid-cols-[0.92fr_1.45fr]">
						<SurfaceCard tone="muted" className="space-y-5 p-5">
							<div className="space-y-2">
								<div className="text-sm font-medium">Status</div>
								<span className={imageJobStatusStyles[job.status] ?? "pill pill-info"}>
									{job.status.replaceAll("_", " ")}
								</span>
							</div>

							<div className="space-y-2 text-sm text-muted-foreground">
								<div>Source: {job.source}</div>
								<div>Request type: {job.requestType}</div>
								<div>Connection: {job.providerLabel}</div>
								<div>Queued: {formatDashboardDate(job.queuedAt)}</div>
								<div>Started: {formatDashboardDate(job.startedAt)}</div>
								<div>Completed: {formatDashboardDate(job.completedAt)}</div>
								{job.aspectRatio ? <div>Aspect ratio: {job.aspectRatio}</div> : null}
								{job.batchId ? <div>Batch: {job.batchId}</div> : null}
							</div>

							<div className="space-y-2">
								<div className="text-sm font-medium">Prompt</div>
								<div className="rounded-[22px] border border-[var(--brand-border-soft)] bg-background/70 p-4 text-sm text-muted-foreground">
									{job.promptText}
								</div>
							</div>

							{job.providerThreadUrl ? (
								<a
									href={job.providerThreadUrl}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
								>
									<ExternalLink className="size-4" />
									Open provider thread
								</a>
							) : null}

							{job.lastError ? (
								<div className="rounded-[22px] border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
									{job.lastError}
								</div>
							) : null}
						</SurfaceCard>

						<DashboardPanel
							title="Outputs"
							description="Downloaded images appear here with open and download actions."
						>
							{outputs.length === 0 ? (
								<EmptyState
									icon={ImageIcon}
									title="No outputs yet"
									description="Outputs will appear here after the provider finishes generating and the worker downloads the files."
								/>
							) : (
								<div className="grid gap-4 md:grid-cols-2">
									{outputs.map((output) => (
										<SurfaceCard key={output.id} className="overflow-hidden p-0">
											<div className="aspect-square overflow-hidden bg-muted">
												{outputUrls[output.id] ? (
													<img
														src={outputUrls[output.id]}
														alt={job.title || "Generated image"}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full items-center justify-center text-muted-foreground">
														<ImageIcon className="size-5" />
													</div>
												)}
											</div>
											<div className="space-y-3 p-4">
												<div className="flex items-center justify-between gap-3">
													<div className="text-sm font-medium">
														{output.width > 0 && output.height > 0
															? `${output.width} × ${output.height}`
															: "Generated image"}
													</div>
													<div className="text-xs text-muted-foreground">
														{Math.max(1, Math.round(output.byteSize / 1024))} KB
													</div>
												</div>
												<div className="flex flex-wrap gap-2">
													<a
														href={outputUrls[output.id]}
														target="_blank"
														rel="noreferrer"
														className="inline-flex"
													>
														<Button variant="outline" className="rounded-full">
															<ExternalLink className="size-4" />
															Open
														</Button>
													</a>
													<a
														href={outputUrls[output.id]}
														download
														target="_blank"
														rel="noreferrer"
														className="inline-flex"
													>
														<Button variant="outline" className="rounded-full">
															<Download className="size-4" />
															Download
														</Button>
													</a>
												</div>
											</div>
										</SurfaceCard>
									))}
								</div>
							)}
						</DashboardPanel>
					</div>
				</>
			) : null}
		</div>
	);
}

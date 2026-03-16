import { ArrowLeft, Bot, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { DashboardPageHeader, DashboardPanel } from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import type { ApiListResponse, ImageJob, ProviderAccount } from "@/lib/api-types";

export function DashboardImageNew() {
	const navigate = useNavigate();
	const { activeWorkspaceId, customerRequest } = useAuth();
	const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
	const [providerAccountId, setProviderAccountId] = useState("");
	const [title, setTitle] = useState("");
	const [promptText, setPromptText] = useState("");
	const [aspectRatio, setAspectRatio] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const readyAccounts = useMemo(
		() => accounts.filter((account) => account.status === "ready" || account.status === "busy"),
		[accounts],
	);

	useEffect(() => {
		if (!activeWorkspaceId) {
			return;
		}
		setLoading(true);
		void customerRequest<ApiListResponse<ProviderAccount>>(
			`/workspaces/${activeWorkspaceId}/provider-accounts`,
		)
			.then((response) => {
				setAccounts(response.items);
				const defaultAccount =
					response.items.find(
						(account) =>
							account.isDefaultForApi &&
							(account.status === "ready" || account.status === "busy"),
					) ??
					response.items.find(
						(account) => account.status === "ready" || account.status === "busy",
					);
				setProviderAccountId(defaultAccount?.id ?? "");
			})
			.catch((loadError) => {
				setError(
					loadError instanceof Error
						? loadError.message
						: "Unable to load provider connections.",
				);
			})
			.finally(() => setLoading(false));
	}, [activeWorkspaceId, customerRequest]);

	async function submit() {
		if (!activeWorkspaceId || !providerAccountId) {
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			const job = await customerRequest<ImageJob>(
				`/workspaces/${activeWorkspaceId}/image-jobs`,
				{
					method: "POST",
					body: {
						providerAccountId,
						title,
						promptText,
						aspectRatio,
					},
				},
			);
			navigate(`/dashboard/images/${job.id}`);
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Unable to queue the image job.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Image generation"
				title="Generate image"
				description="Queue a single browser-backed image job with an optional title, aspect ratio, and connected provider."
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

			<DashboardPanel
				title="New image"
				description="This creates one queued image job that appears in the shared images table."
			>
				<SurfaceCard tone="muted" className="space-y-5 p-5">
					{error ? (
						<div className="rounded-[22px] border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
							{error}
						</div>
					) : null}

					{!loading && readyAccounts.length === 0 ? (
						<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/65 p-6">
							<div className="flex items-start gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<Bot className="size-5" />
								</div>
								<div className="space-y-3">
									<div>
										<div className="font-medium">No connected provider yet</div>
										<div className="mt-1 text-sm text-muted-foreground">
											Connect ChatGPT first, then return here to queue image jobs.
										</div>
									</div>
									<Button
										className="rounded-full bg-gradient-brand border-0 text-white"
										onClick={() => navigate("/dashboard/images/connections")}
									>
										Connect account
									</Button>
								</div>
							</div>
						</div>
					) : (
						<form
							className="grid gap-5 lg:grid-cols-[0.9fr_1.3fr]"
							onSubmit={(event) => {
								event.preventDefault();
								void submit();
							}}
						>
							<div className="space-y-4">
								<label className="block space-y-2">
									<span className="text-sm font-medium">Title</span>
									<Input
										className="h-11 rounded-2xl"
										value={title}
										onChange={(event) => setTitle(event.target.value)}
										placeholder="Spring launch hero"
									/>
								</label>
								<label className="block space-y-2">
									<span className="text-sm font-medium">Provider connection</span>
									<NativeSelect
										className="w-full"
										value={providerAccountId}
										onChange={(event) => setProviderAccountId(event.target.value)}
										required
									>
										<NativeSelectOption value="" disabled>
											Select a connected provider
										</NativeSelectOption>
										{readyAccounts.map((account) => (
											<NativeSelectOption key={account.id} value={account.id}>
												{account.label} {account.isDefaultForApi ? "(Default API)" : ""}
											</NativeSelectOption>
										))}
									</NativeSelect>
								</label>
								<label className="block space-y-2">
									<span className="text-sm font-medium">Aspect ratio</span>
									<NativeSelect
										className="w-full"
										value={aspectRatio}
										onChange={(event) => setAspectRatio(event.target.value)}
									>
										<NativeSelectOption value="">Default</NativeSelectOption>
										<NativeSelectOption value="1:1">1:1</NativeSelectOption>
										<NativeSelectOption value="4:5">4:5</NativeSelectOption>
										<NativeSelectOption value="16:9">16:9</NativeSelectOption>
										<NativeSelectOption value="9:16">9:16</NativeSelectOption>
									</NativeSelect>
								</label>
							</div>

							<div className="space-y-4">
								<label className="block space-y-2">
									<span className="text-sm font-medium">Prompt</span>
									<Textarea
										className="min-h-[260px] rounded-[26px]"
										value={promptText}
										onChange={(event) => setPromptText(event.target.value)}
										placeholder="Create a polished product campaign image with warm studio light, generous negative space, and crisp editorial styling."
										required
									/>
								</label>
								<Button
									type="submit"
									className="rounded-full bg-gradient-brand border-0 text-white"
									disabled={submitting || loading || !providerAccountId}
								>
									{submitting ? (
										<LoaderCircle className="size-4 animate-spin" />
									) : (
										<Sparkles className="size-4" />
									)}
									Queue image
								</Button>
							</div>
						</form>
					)}
				</SurfaceCard>
			</DashboardPanel>
		</div>
	);
}

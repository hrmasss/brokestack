import { ArrowLeft, Bot, FileUp, Layers3, LoaderCircle } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { DashboardPageHeader, DashboardPanel } from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import type { ApiListResponse, ImageBatchResult, ProviderAccount } from "@/lib/api-types";

function parseCSVValues(raw: string) {
	return raw
		.split(/\r?\n/)
		.flatMap((line) => line.split(","))
		.map((value) => value.trim())
		.filter(Boolean);
}

export function DashboardImageBatch() {
	const navigate = useNavigate();
	const { activeWorkspaceId, customerRequest } = useAuth();
	const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
	const [providerAccountId, setProviderAccountId] = useState("");
	const [title, setTitle] = useState("");
	const [promptTemplate, setPromptTemplate] = useState("");
	const [placeholderName, setPlaceholderName] = useState("item");
	const [aspectRatio, setAspectRatio] = useState("");
	const [valuesText, setValuesText] = useState("");
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

	async function handleCSVUpload(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}
		const text = await file.text();
		const parsed = parseCSVValues(text);
		setValuesText((current) =>
			[current.trim(), ...parsed].filter(Boolean).join("\n"),
		);
	}

	async function submit() {
		if (!activeWorkspaceId || !providerAccountId) {
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			const result = await customerRequest<ImageBatchResult>(
				`/workspaces/${activeWorkspaceId}/image-batches`,
				{
					method: "POST",
					body: {
						providerAccountId,
						title,
						promptTemplate,
						placeholderName,
						aspectRatio,
						values: valuesText
							.split(/\r?\n/)
							.map((value) => value.trim())
							.filter(Boolean),
					},
				},
			);
			navigate(`/dashboard/images/${result.jobs[0]?.id ?? ""}`);
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Unable to queue the batch image jobs.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Batch generation"
				title="Generate batch images"
				description="Queue a grouped batch request that fans out into individually scheduled image jobs."
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
				title="New batch"
				description="Use a prompt template plus placeholder values. Each value becomes its own queued image job."
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
										<div className="font-medium">Connect ChatGPT first</div>
										<div className="mt-1 text-sm text-muted-foreground">
											Batch image generation is only available after at least one
											provider account is ready.
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
							className="grid gap-5 xl:grid-cols-[0.95fr_1.35fr]"
							onSubmit={(event) => {
								event.preventDefault();
								void submit();
							}}
						>
							<div className="space-y-4">
								<label className="block space-y-2">
									<span className="text-sm font-medium">Batch title</span>
									<Input
										className="h-11 rounded-2xl"
										value={title}
										onChange={(event) => setTitle(event.target.value)}
										placeholder="Launch concept sweep"
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
												{account.label}
											</NativeSelectOption>
										))}
									</NativeSelect>
								</label>
								<label className="block space-y-2">
									<span className="text-sm font-medium">Placeholder variable</span>
									<Input
										className="h-11 rounded-2xl"
										value={placeholderName}
										onChange={(event) => setPlaceholderName(event.target.value)}
										placeholder="item"
										required
									/>
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
									<span className="text-sm font-medium">Prompt template</span>
									<Textarea
										className="min-h-[170px] rounded-[26px]"
										value={promptTemplate}
										onChange={(event) => setPromptTemplate(event.target.value)}
										placeholder="Generate a campaign visual for {{item}} with cinematic lighting, premium materials, and negative space for product copy."
										required
									/>
								</label>
								<label className="block space-y-2">
									<span className="text-sm font-medium">Placeholder values</span>
									<Textarea
										className="min-h-[180px] rounded-[26px]"
										value={valuesText}
										onChange={(event) => setValuesText(event.target.value)}
										placeholder={"spring collection\nholiday launch\neditorial portrait"}
										required
									/>
								</label>
								<label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--brand-border-soft)] bg-background/70 px-4 py-2 text-sm font-medium">
									<FileUp className="size-4" />
									Upload CSV
									<input
										type="file"
										className="hidden"
										accept=".csv,text/csv"
										onChange={(event) => void handleCSVUpload(event)}
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
										<Layers3 className="size-4" />
									)}
									Queue batch
								</Button>
							</div>
						</form>
					)}
				</SurfaceCard>
			</DashboardPanel>
		</div>
	);
}

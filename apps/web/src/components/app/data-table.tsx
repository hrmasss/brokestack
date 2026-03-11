import type { LucideIcon } from "lucide-react";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsUpDown,
	GripVertical,
	LayoutGrid,
	List,
	MoreHorizontal,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import {
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	startTransition,
	useDeferredValue,
	useEffect,
	useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
	id: string;
	label: string;
	accessor: (row: T) => ReactNode;
	getSortValue?: (row: T) => number | string;
	width?: number;
	minWidth?: number;
	className?: string;
	headerClassName?: string;
	cardLabel?: string;
	cardValue?: (row: T) => ReactNode;
};

export type DataTableFilter<T> = {
	id: string;
	label: string;
	options: Array<{ label: string; value: string }>;
	getValue: (row: T) => string;
};

type ToolbarAction = {
	label: string;
	icon?: LucideIcon;
	onClick?: () => void;
	variant?: "default" | "outline" | "ghost";
};

type RowAction<T> = {
	label: string;
	icon?: LucideIcon;
	onClick?: (row: T) => void;
	destructive?: boolean;
};

function ToolbarDropdown({
	label,
	value,
	valueLabel,
	options,
	onValueChange,
}: {
	label: string;
	value: string;
	valueLabel: string;
	options: Array<{ label: string; value: string }>;
	onValueChange: (value: string) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label={label}
					className="flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border-soft)] bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent/60"
				>
					<span className="truncate">
						{label}: {valueLabel}
					</span>
					<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="rounded-[24px] p-2">
				<DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
					{options.map((option) => (
						<DropdownMenuRadioItem
							key={option.value}
							value={option.value}
							className="rounded-[18px] px-3 py-2.5"
						>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function DataTable<T>({
	title,
	description,
	rows,
	columns,
	getRowId,
	getSearchText,
	filters = [],
	globalActions = [],
	rowActions = [],
	emptyState,
	renderGridCard,
	loading = false,
	error = null,
	initialView = "list",
	pageSizeOptions = [6, 12, 24],
	searchPlaceholder = "Search items, owners, or notes...",
	gridClassName,
	onRowClick,
}: {
	title?: string;
	description?: string;
	rows: T[];
	columns: DataTableColumn<T>[];
	getRowId: (row: T) => string;
	getSearchText: (row: T) => string;
	filters?: DataTableFilter<T>[];
	globalActions?: ToolbarAction[];
	rowActions?: RowAction<T>[];
	emptyState: {
		title: string;
		description: string;
		actionLabel?: string;
		onAction?: () => void;
	};
	renderGridCard?: (row: T) => ReactNode;
	loading?: boolean;
	error?: string | null;
	initialView?: "list" | "grid";
	pageSizeOptions?: number[];
	searchPlaceholder?: string;
	gridClassName?: string;
	onRowClick?: (row: T) => void;
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const defaultSortColumn =
		columns.find((column) => column.getSortValue)?.id ?? columns[0]?.id ?? "";
	const deferredSearchQuery = useDeferredValue(searchQuery);
	const [activeView, setActiveView] = useState<"list" | "grid">(initialView);
	const [pageSize, setPageSize] = useState(pageSizeOptions[0] ?? 6);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortColumnId, setSortColumnId] = useState(defaultSortColumn);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [columnOrder, setColumnOrder] = useState(
		columns.map((column) => column.id),
	);
	const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
	const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
		Object.fromEntries(
			columns.map((column) => [column.id, column.width ?? 180]),
		),
	);
	const [filterValues, setFilterValues] = useState<Record<string, string>>(
		Object.fromEntries(filters.map((filter) => [filter.id, "all"])),
	);

	const resolvedSearchQuery = deferredSearchQuery.trim().toLowerCase();
	const orderedColumns = columnOrder
		.map((id) => columns.find((column) => column.id === id))
		.filter((column): column is DataTableColumn<T> => Boolean(column));
	const sortableColumns = columns.filter((column) => column.getSortValue);
	const selectedSortColumn = columns.find(
		(column) => column.id === sortColumnId,
	);
	const sortOptions = sortableColumns.flatMap((column) => [
		{ label: `${column.label} ↑`, value: `${column.id}:asc` },
		{ label: `${column.label} ↓`, value: `${column.id}:desc` },
	]);

	const filteredRows = rows.filter((row) => {
		const matchesSearch =
			!resolvedSearchQuery ||
			getSearchText(row).toLowerCase().includes(resolvedSearchQuery);
		const matchesFilters = filters.every((filter) => {
			const value = filterValues[filter.id];
			return !value || value === "all" ? true : filter.getValue(row) === value;
		});

		return matchesSearch && matchesFilters;
	});

	const sortedRows = [...filteredRows].sort((left, right) => {
		const sortColumn = columns.find((column) => column.id === sortColumnId);
		if (!sortColumn?.getSortValue) {
			return 0;
		}

		const leftValue = sortColumn.getSortValue(left);
		const rightValue = sortColumn.getSortValue(right);

		if (leftValue === rightValue) {
			return 0;
		}

		if (leftValue > rightValue) {
			return sortDirection === "asc" ? 1 : -1;
		}

		return sortDirection === "asc" ? -1 : 1;
	});

	const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
	const paginatedRows = sortedRows.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(max-width: 767px)").matches
		) {
			setActiveView("grid");
		}
	}, []);

	function cycleSort(columnId: string) {
		const column = columns.find((item) => item.id === columnId);
		if (!column?.getSortValue) {
			return;
		}

		if (sortColumnId === columnId) {
			setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
			return;
		}

		setSortColumnId(columnId);
		setSortDirection("asc");
	}

	function reorderColumns(targetColumnId: string) {
		if (!draggedColumnId || draggedColumnId === targetColumnId) {
			return;
		}

		setColumnOrder((current) => {
			const next = [...current];
			const fromIndex = next.indexOf(draggedColumnId);
			const toIndex = next.indexOf(targetColumnId);

			if (fromIndex < 0 || toIndex < 0) {
				return current;
			}

			next.splice(fromIndex, 1);
			next.splice(toIndex, 0, draggedColumnId);
			return next;
		});
		setDraggedColumnId(null);
	}

	function startResize(
		event: ReactMouseEvent<HTMLButtonElement>,
		column: DataTableColumn<T>,
	) {
		event.preventDefault();
		event.stopPropagation();

		const startX = event.clientX;
		const startWidth = columnWidths[column.id] ?? column.width ?? 180;

		const onMouseMove = (moveEvent: MouseEvent) => {
			setColumnWidths((current) => ({
				...current,
				[column.id]: Math.max(
					column.minWidth ?? 140,
					startWidth + (moveEvent.clientX - startX),
				),
			}));
		};

		const onMouseUp = () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	}

	function resetControls() {
		setSearchQuery("");
		setFilterValues(
			Object.fromEntries(filters.map((filter) => [filter.id, "all"])),
		);
		setSortColumnId(defaultSortColumn);
		setSortDirection("asc");
		setCurrentPage(1);
		setActiveView(initialView);
	}

	function PaginationBar() {
		return (
			<div className="flex flex-col gap-3 border-y border-[var(--brand-border-soft)] py-3 md:flex-row md:items-center md:justify-between">
				<div className="text-sm text-muted-foreground">
					Showing {(currentPage - 1) * pageSize + 1}-
					{Math.min(currentPage * pageSize, sortedRows.length)} of{" "}
					{sortedRows.length} items
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>Rows</span>
						<Select
							value={String(pageSize)}
							onValueChange={(value) => {
								setPageSize(Number(value));
								setCurrentPage(1);
							}}
						>
							<SelectTrigger className="h-9 w-[88px] rounded-full bg-card">
								<SelectValue />
							</SelectTrigger>
							<SelectContent align="end">
								{pageSizeOptions.map((option) => (
									<SelectItem key={option} value={String(option)}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="size-4" />
						</Button>
						<div className="rounded-full border border-[var(--brand-border-soft)] px-3 py-1 text-sm">
							Page {currentPage} / {totalPages}
						</div>
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() =>
								setCurrentPage((page) => Math.min(totalPages, page + 1))
							}
							disabled={currentPage === totalPages}
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-2">
					{title ? (
						<div className="text-xl font-semibold tracking-tight">{title}</div>
					) : null}
					{description ? (
						<p className="max-w-2xl text-sm text-muted-foreground">
							{description}
						</p>
					) : null}
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{globalActions.map((action) => (
						<Button
							key={action.label}
							variant={action.variant ?? "outline"}
							className="rounded-full"
							onClick={action.onClick}
						>
							{action.icon ? <action.icon className="size-4" /> : null}
							{action.label}
						</Button>
					))}
				</div>
			</div>

			<div className="flex flex-col gap-4 rounded-[28px] border border-[var(--brand-border-soft)] bg-background/70 p-4 md:p-5">
				<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
					<div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
						<div className="relative min-w-0 flex-1 lg:max-w-sm">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(event) =>
									startTransition(() => {
										setSearchQuery(event.target.value);
										setCurrentPage(1);
									})
								}
								placeholder={searchPlaceholder}
								className="h-10 rounded-full bg-card pl-10"
							/>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							{filters.map((filter) => {
								const currentValue = filterValues[filter.id] ?? "all";
								const selectedOption = filter.options.find(
									(option) => option.value === currentValue,
								);

								return (
									<ToolbarDropdown
										key={filter.id}
										label={filter.label}
										value={currentValue}
										valueLabel={selectedOption?.label ?? "All"}
										options={[
											{ label: "All", value: "all" },
											...filter.options,
										]}
										onValueChange={(nextValue) =>
											startTransition(() => {
												setFilterValues((current) => ({
													...current,
													[filter.id]: nextValue,
												}));
												setCurrentPage(1);
											})
										}
									/>
								);
							})}
							{sortableColumns.length ? (
								<ToolbarDropdown
									label="Sort"
									value={`${sortColumnId}:${sortDirection}`}
									valueLabel={`${selectedSortColumn?.label ?? "None"} ${
										sortDirection === "asc" ? "↑" : "↓"
									}`}
									options={sortOptions}
									onValueChange={(nextValue) => {
										const [columnId, direction] = nextValue.split(":");
										setSortColumnId(columnId);
										setSortDirection(direction as "asc" | "desc");
									}}
								/>
							) : null}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							className="rounded-full"
							onClick={resetControls}
						>
							<SlidersHorizontal className="size-4" />
							Reset
						</Button>
						<div className="flex items-center rounded-full border border-[var(--brand-border-soft)] bg-card p-1">
							<Button
								variant={activeView === "list" ? "default" : "ghost"}
								size="sm"
								className="rounded-full"
								onClick={() => setActiveView("list")}
							>
								<List className="size-4" />
								List
							</Button>
							<Button
								variant={activeView === "grid" ? "default" : "ghost"}
								size="sm"
								className="rounded-full"
								onClick={() => setActiveView("grid")}
							>
								<LayoutGrid className="size-4" />
								Grid
							</Button>
						</div>
					</div>
				</div>

				<PaginationBar />

				{loading ? (
					<LoadingState
						variant={activeView === "list" ? "table" : "card"}
						count={pageSize}
					/>
				) : null}

				{!loading && error ? (
					<ErrorState title="Table unavailable" description={error} />
				) : null}

				{!loading && !error && !sortedRows.length ? (
					<EmptyState
						title={emptyState.title}
						description={emptyState.description}
						action={
							emptyState.actionLabel && emptyState.onAction
								? {
										label: emptyState.actionLabel,
										onClick: emptyState.onAction,
									}
								: undefined
						}
					/>
				) : null}

				{!loading && !error && sortedRows.length ? (
					activeView === "list" ? (
						<Table className="min-w-[900px]">
							<TableHeader>
								<TableRow className="hover:bg-transparent">
									{orderedColumns.map((column) => (
										<TableHead
											key={column.id}
											draggable
											onDragStart={() => setDraggedColumnId(column.id)}
											onDragOver={(event) => event.preventDefault()}
											onDrop={() => reorderColumns(column.id)}
											style={{ width: columnWidths[column.id] }}
											className={cn(
												"relative select-none",
												column.headerClassName,
											)}
										>
											<button
												type="button"
												className="flex w-full items-center gap-2 pr-4 text-left"
												onClick={() => cycleSort(column.id)}
											>
												<GripVertical className="size-3.5 text-muted-foreground" />
												<span>{column.label}</span>
												{column.getSortValue ? (
													<ChevronsUpDown className="size-3.5 text-muted-foreground" />
												) : null}
											</button>
											<button
												type="button"
												className="absolute inset-y-1 right-0 w-3 cursor-col-resize rounded-full hover:bg-primary/10"
												onMouseDown={(event) => startResize(event, column)}
												aria-label={`Resize ${column.label} column`}
											/>
										</TableHead>
									))}
									{rowActions.length ? (
										<TableHead className="w-14 text-right">Actions</TableHead>
									) : null}
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedRows.map((row) => (
									<TableRow
										key={getRowId(row)}
										onClick={onRowClick ? () => onRowClick(row) : undefined}
										className={cn(
											onRowClick &&
												"cursor-pointer transition-colors hover:bg-accent/40",
										)}
									>
										{orderedColumns.map((column) => (
											<TableCell
												key={`${getRowId(row)}-${column.id}`}
												style={{ width: columnWidths[column.id] }}
												className={column.className}
											>
												{column.accessor(row)}
											</TableCell>
										))}
										{rowActions.length ? (
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={(event) => event.stopPropagation()}
														>
															<MoreHorizontal className="size-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														{rowActions.map((action) => (
															<DropdownMenuItem
																key={action.label}
																className={cn(
																	action.destructive && "text-destructive",
																)}
																onClick={(event) => {
																	event.stopPropagation();
																	action.onClick?.(row);
																}}
															>
																{action.icon ? (
																	<action.icon className="size-4" />
																) : null}
																{action.label}
															</DropdownMenuItem>
														))}
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										) : null}
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div
							className={cn(
								"grid gap-4 md:grid-cols-2 xl:grid-cols-3",
								gridClassName,
							)}
						>
							{paginatedRows.map((row) => (
								<div
									key={getRowId(row)}
									onClick={onRowClick ? () => onRowClick(row) : undefined}
									className={cn(
										"rounded-[26px] border border-[var(--brand-border-soft)] bg-card p-5",
										onRowClick &&
											"cursor-pointer transition-colors hover:bg-accent/20",
									)}
								>
									{renderGridCard ? (
										renderGridCard(row)
									) : (
										<div className="space-y-3">
											{orderedColumns.slice(0, 4).map((column) => (
												<div
													key={`${getRowId(row)}-card-${column.id}`}
													className="space-y-1"
												>
													<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
														{column.cardLabel ?? column.label}
													</div>
													<div className="text-sm">
														{column.cardValue
															? column.cardValue(row)
															: column.accessor(row)}
													</div>
												</div>
											))}
										</div>
									)}
									{rowActions.length ? (
										<div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--brand-border-soft)] pt-4">
											{rowActions.slice(0, 2).map((action) => (
												<Button
													key={action.label}
													variant="outline"
													size="sm"
													className="rounded-full"
													onClick={() => action.onClick?.(row)}
												>
													{action.icon ? (
														<action.icon className="size-4" />
													) : null}
													{action.label}
												</Button>
											))}
										</div>
									) : null}
								</div>
							))}
						</div>
					)
				) : null}

				<PaginationBar />
			</div>
		</div>
	);
}

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileQuestion,
  Inbox,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

// =============================================================================
// LOADING STATE
// =============================================================================

interface LoadingStateProps {
  className?: string;
  variant?: "card" | "table" | "list" | "page";
  count?: number;
}

export function LoadingState({
  className,
  variant = "card",
  count = 3,
}: LoadingStateProps) {
  if (variant === "page") {
    return (
      <div className={cn("space-y-6 animate-in fade-in duration-300", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: card variant
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

interface EmptyStateProps {
  className?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  className,
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in duration-300",
        className
      )}
    >
      <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="size-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

interface ErrorStateProps {
  className?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  variant?: "inline" | "page";
}

export function ErrorState({
  className,
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  variant = "inline",
}: ErrorStateProps) {
  if (variant === "page") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in duration-300",
          className
        )}
      >
        <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="size-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-md mb-8">{description}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="size-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5 animate-in fade-in duration-300",
        className
      )}
    >
      <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="ghost" size="sm">
          <RefreshCw className="size-4" />
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// NOT FOUND STATE
// =============================================================================

interface NotFoundStateProps {
  className?: string;
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function NotFoundState({
  className,
  title = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  backHref = "/",
  backLabel = "Go back home",
}: NotFoundStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in duration-300",
        className
      )}
    >
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>
      <Button asChild variant="outline">
        <a href={backHref}>{backLabel}</a>
      </Button>
    </div>
  );
}

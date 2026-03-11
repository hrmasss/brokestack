import {
  ArrowRight,
  Eye,
  EyeOff,
  FolderKanban,
  LockKeyhole,
  Mail,
  Sparkles,
  User2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import {
  BrandBackdrop,
  SectionTag,
  StatChip,
  SurfaceCard,
} from "@/components/app/brand";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const companionStats = [
  { label: "Teams onboarded", value: "2,000+", detail: "Across global brands" },
  { label: "Approval time", value: "-38%", detail: "Faster launch cycles" },
];

type AuthMode = "login" | "signup";

function defaultWorkspaceName(fullName: string) {
  const trimmedName = fullName.trim();
  if (!trimmedName) {
    return "User's Workspace";
  }
  return trimmedName.toLowerCase().endsWith("s")
    ? `${trimmedName}' Workspace`
    : `${trimmedName}'s Workspace`;
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="none">
      <path
        d="M21.8 12.23c0-.74-.07-1.45-.2-2.13H12v4.03h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.77 3.05-4.39 3.05-7.54Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.91 6.77-2.47l-3.3-2.56c-.91.61-2.08.98-3.47.98-2.66 0-4.92-1.8-5.73-4.21H2.86v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.27 13.74A5.96 5.96 0 0 1 5.95 12c0-.61.11-1.2.32-1.74V7.62H2.86a10 10 0 0 0 0 8.76l3.41-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.05c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.07 3.04 14.75 2 12 2A10 10 0 0 0 2.86 7.62l3.41 2.64C7.08 7.85 9.34 6.05 12 6.05Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="none">
      <path
        d="M3 3h8.5v8.5H3V3Z"
        fill="#F25022"
      />
      <path
        d="M12.5 3H21v8.5h-8.5V3Z"
        fill="#7FBA00"
      />
      <path
        d="M3 12.5h8.5V21H3v-8.5Z"
        fill="#00A4EF"
      />
      <path
        d="M12.5 12.5H21V21h-8.5v-8.5Z"
        fill="#FFB900"
      />
    </svg>
  );
}

export function AuthView({ mode }: { mode: AuthMode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const { signInCustomer, signUpCustomer } = useAuth();
  const nameFieldId = `${mode}-name`;
  const workspaceFieldId = `${mode}-workspace`;
  const emailFieldId = `${mode}-email`;
  const passwordFieldId = `${mode}-password`;
  const confirmPasswordFieldId = `${mode}-confirm-password`;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceNameTouched, setWorkspaceNameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = isSignup ? "Create your team workspace" : "Welcome back";
  const description = isSignup
    ? "Start a BrokeStack workspace for tool runs, API access, automation, and shared operational work."
    : "Pick up where your team left off with the same runs, workflows, and usage views shown across the product.";
  const primaryLabel = isSignup ? "Create account" : "Continue to dashboard";
  const alternatePrompt = isSignup
    ? "Already have an account?"
    : "Need a new workspace?";
  const alternateHref = isSignup ? "/login" : "/signup";
  const alternateLabel = isSignup ? "Sign in" : "Create one";

  useEffect(() => {
    if (!isSignup || workspaceNameTouched) {
      return;
    }
    setWorkspaceName(defaultWorkspaceName(fullName));
  }, [fullName, isSignup, workspaceNameTouched]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signUpCustomer({
          fullName,
          email,
          password,
          workspaceName: workspaceName.trim() || defaultWorkspaceName(fullName),
        });
      } else {
        await signInCustomer({ email, password });
      }
      navigate("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to continue with those credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell auth-shell relative min-h-[100dvh] overflow-hidden">
      <BrandBackdrop />
      <div className="hero-halo left-[-10rem] top-[8rem] h-[24rem] w-[24rem] bg-[var(--brand-glow-strong)] opacity-60" />
      <div className="hero-halo bottom-[-8rem] right-[-6rem] h-[22rem] w-[22rem] bg-[var(--brand-glow)] opacity-50" />
      <div className="brand-grid absolute inset-0 opacity-15 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-[1240px] grid-rows-[auto_1fr] px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <header className="flex h-12 items-center justify-between">
          <Link to="/">
            <Logo
              size="sm"
              showText
            />
          </Link>
          <ThemeToggle compact />
        </header>

        <main className="auth-main min-h-0 py-4 sm:py-5">
          <div className="auth-main-grid">
            <SurfaceCard
              tone="strong"
              className="auth-shell-card relative overflow-hidden p-4 sm:p-5 lg:p-6">
              <div className="brand-grid absolute inset-0 opacity-10" />
              <div className="hero-halo right-0 top-0 h-36 w-36 bg-[var(--brand-glow-strong)] opacity-35" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--brand-highlight)_18%,transparent),transparent_58%)]" />

              <div className="auth-shell-sections relative z-10">
                <section className="auth-pane auth-companion p-5 sm:p-6 lg:p-7">
                  <SectionTag>
                    <Sparkles className="size-3.5" />
                    {isSignup ? "Start the workspace" : "Operator access"}
                  </SectionTag>
                  <h1 className="mt-5 text-[clamp(2.15rem,2.55vw,3.2rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
                    <span className="block">The tools</span>
                    <span className="block text-gradient-brand">
                      command center
                    </span>
                    <span className="block">starts here.</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                    Bring tool runs, workflows, and usage into one calm workspace
                    designed for teams that need fewer handoffs.
                  </p>

                  <div className="auth-card-group mt-4 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {companionStats.map((stat) => (
                        <StatChip
                          key={stat.label}
                          label={stat.label}
                          value={stat.value}
                          detail={stat.detail}
                        />
                      ))}
                    </div>

                    <div className="auth-card-subsection mt-3 p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-[var(--brand-accent)]">
                        Why teams switch
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Run status, workflow checks, and usage stay connected
                        instead of drifting across docs, chat, and external
                        tabs.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="auth-pane auth-card p-5 sm:p-6">
                  <div className="inline-flex w-fit self-start rounded-full border border-[var(--brand-border-soft)] bg-background/75 p-1 backdrop-blur-sm">
                    <Link
                      to="/login"
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        !isSignup
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}>
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        isSignup
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}>
                      Create account
                    </Link>
                  </div>

                  <h2 className="mt-5 text-[1.9rem] font-semibold tracking-tight sm:text-[2.1rem]">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>

                  <div className="auth-card-group mt-4 p-4 sm:p-5">
                    <div className="auth-social-grid gap-2">
                      <Button
                        variant="outline"
                        className="h-10 rounded-2xl border-[var(--brand-border-soft)] bg-background/55"
                        type="button">
                        <GoogleIcon />
                        <span>Google</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-2xl border-[var(--brand-border-soft)] bg-background/55"
                        type="button">
                        <MicrosoftIcon />
                        <span>Microsoft</span>
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <div className="h-px flex-1 bg-[var(--brand-border-soft)]" />
                      <span>
                        {isSignup ? "Or use email" : "Or continue with email"}
                      </span>
                      <div className="h-px flex-1 bg-[var(--brand-border-soft)]" />
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className={cn(
                        "mt-4 gap-3.5",
                        isSignup ? "auth-signup-fields grid" : "space-y-3.5",
                      )}>
                      {isSignup ? (
                        <label
                          className="block space-y-1.5"
                          htmlFor={nameFieldId}>
                          <span className="text-sm font-medium">Your name</span>
                          <div className="relative">
                            <User2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id={nameFieldId}
                              value={fullName}
                              onChange={(event) => setFullName(event.target.value)}
                              className="h-11 rounded-2xl border-[var(--brand-border-soft)] bg-background/65 pl-10"
                              placeholder="Alex Morgan"
                            />
                          </div>
                        </label>
                      ) : null}

                      {isSignup ? (
                        <label
                          className="block space-y-1.5"
                          htmlFor={workspaceFieldId}>
                          <span className="text-sm font-medium">Workspace name</span>
                          <div className="relative">
                            <FolderKanban className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id={workspaceFieldId}
                              value={workspaceName}
                              onChange={(event) => {
                                setWorkspaceNameTouched(true);
                                setWorkspaceName(event.target.value);
                              }}
                              className="h-11 rounded-2xl border-[var(--brand-border-soft)] bg-background/65 pl-10"
                              placeholder={defaultWorkspaceName(fullName)}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Leave it blank and BrokeStack will use{" "}
                            {defaultWorkspaceName(fullName)}.
                          </div>
                        </label>
                      ) : null}

                      <label
                        className="block space-y-1.5"
                        htmlFor={emailFieldId}>
                        <span className="text-sm font-medium">Work email</span>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id={emailFieldId}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="h-11 rounded-2xl border-[var(--brand-border-soft)] bg-background/65 pl-10"
                            placeholder="you@company.com"
                          />
                        </div>
                      </label>

                      <label
                        className="block space-y-1.5"
                        htmlFor={passwordFieldId}>
                        <span className="text-sm font-medium">Password</span>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id={passwordFieldId}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="h-11 rounded-2xl border-[var(--brand-border-soft)] bg-background/65 pl-10 pr-11"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((current) => !current)
                            }
                            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }>
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </label>

                      {isSignup ? (
                        <label
                          className="block space-y-1.5"
                          htmlFor={confirmPasswordFieldId}>
                          <span className="text-sm font-medium">
                            Confirm password
                          </span>
                          <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id={confirmPasswordFieldId}
                              value={confirmPassword}
                              onChange={(event) =>
                                setConfirmPassword(event.target.value)
                              }
                              className="h-11 rounded-2xl border-[var(--brand-border-soft)] bg-background/65 pl-10 pr-11"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword((current) => !current)
                              }
                              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={
                                showConfirmPassword
                                  ? "Hide confirm password"
                                  : "Show confirm password"
                              }>
                              {showConfirmPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                        </label>
                      ) : null}
                    </form>

                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span>
                        {isSignup
                          ? "14-day trial included. No credit card required."
                          : "Use your work credentials to reopen the workspace."}
                      </span>
                      {!isSignup ? (
                        <Link
                          to="/signup"
                          className="font-medium text-foreground transition-colors hover:text-primary">
                          Create account
                        </Link>
                      ) : null}
                    </div>

                    {error ? (
                      <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                      </div>
                    ) : null}

                    <Button
                      type="submit"
                      form={undefined}
                      onClick={(event) => {
                        const form = event.currentTarget
                          .closest(".auth-card-group")
                          ?.querySelector("form");
                        if (form instanceof HTMLFormElement) {
                          form.requestSubmit();
                        }
                      }}
                      disabled={loading}
                      className="mt-4 h-11 w-full rounded-full bg-gradient-brand text-white border-0">
                      {loading ? "Working..." : primaryLabel}
                      <ArrowRight className="size-4" />
                    </Button>

                    <div className="auth-secondary-actions mt-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-10 rounded-full border-[var(--brand-border-soft)] bg-background/50"
                        asChild>
                        <Link to="/features">Explore product</Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-full border-[var(--brand-border-soft)] bg-background/50"
                        asChild>
                        <Link to="/pricing">
                          {isSignup ? "Compare plans" : "See pricing"}
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <p className="mt-auto pt-4 text-center text-sm text-muted-foreground">
                    {alternatePrompt}{" "}
                    <Link
                      to={alternateHref}
                      className="font-medium text-foreground transition-colors hover:text-primary">
                      {alternateLabel}
                    </Link>
                  </p>
                </section>
              </div>
            </SurfaceCard>
          </div>
        </main>
      </div>
    </div>
  );
}

import {
	ArrowRight,
	Eye,
	EyeOff,
	LockKeyhole,
	Mail,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { BrandBackdrop, SurfaceCard } from "@/components/app/brand";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export function AdminLoginPage() {
	const navigate = useNavigate();
	const { signInPlatform } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("admin@test.com");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await signInPlatform({ email, password });
			navigate("/admin");
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Unable to sign in to the admin portal.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="app-shell auth-shell relative min-h-[100dvh] overflow-hidden">
			<BrandBackdrop />
			<div className="hero-halo left-[-10rem] top-[8rem] h-[24rem] w-[24rem] bg-amber-500/30 opacity-60" />
			<div className="hero-halo bottom-[-8rem] right-[-6rem] h-[22rem] w-[22rem] bg-orange-500/25 opacity-50" />
			<div className="brand-grid absolute inset-0 opacity-15 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

			<div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
				<header className="flex h-12 items-center justify-between">
					<Link to="/">
						<Logo size="sm" showText />
					</Link>
					<ThemeToggle compact />
				</header>

				<main className="flex flex-1 items-center justify-center py-8">
					<SurfaceCard
						tone="strong"
						className="relative w-full overflow-hidden p-6 sm:p-8"
					>
						<div className="brand-grid absolute inset-0 opacity-10" />
						<div className="hero-halo right-0 top-0 h-36 w-36 bg-amber-500/25 opacity-35" />
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,rgb(245,158,11)_12%,transparent),transparent_58%)]" />

						<div className="relative z-10 space-y-6">
							<div className="flex justify-center">
								<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400">
									<ShieldCheck className="size-4" />
									Admin Portal
								</div>
							</div>

							<div className="space-y-2 text-center">
								<h1 className="text-3xl font-semibold tracking-tight">
									Admin Access
								</h1>
								<p className="text-sm text-muted-foreground">
									Sign in to the BrokeStack administration panel to manage users,
									subscriptions, tooling operations, and system settings.
								</p>
							</div>

							<form
								onSubmit={handleSubmit}
								className="auth-card-group rounded-2xl border border-[var(--brand-border-soft)] bg-background/60 p-5 backdrop-blur-sm"
							>
								<div className="space-y-4">
									<label className="block space-y-1.5" htmlFor="admin-email">
										<span className="text-sm font-medium">Admin email</span>
										<div className="relative">
											<Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="admin-email"
												name="email"
												autoComplete="email"
												value={email}
												onChange={(event) => setEmail(event.target.value)}
												className="h-11 rounded-2xl border-[var(--brand-border-soft)] bg-background/65 pl-10"
												placeholder="admin@brokestack.app"
											/>
										</div>
									</label>

									<label className="block space-y-1.5" htmlFor="admin-password">
										<span className="text-sm font-medium">Password</span>
										<div className="relative">
											<LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="admin-password"
												name="password"
												autoComplete="current-password"
												value={password}
												onChange={(event) => setPassword(event.target.value)}
												className="h-11 rounded-2xl border-[var(--brand-border-soft)] bg-background/65 pl-10 pr-11"
												type={showPassword ? "text" : "password"}
												placeholder="••••••••"
											/>
											<button
												type="button"
												onClick={() => setShowPassword((current) => !current)}
												className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
												aria-label={
													showPassword ? "Hide password" : "Show password"
												}
											>
												{showPassword ? (
													<EyeOff className="size-4" />
												) : (
													<Eye className="size-4" />
												)}
											</button>
										</div>
									</label>
								</div>

								{error ? (
									<div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
										{error}
									</div>
								) : null}

								<Button
									type="submit"
									disabled={loading}
									className="mt-5 h-11 w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 hover:from-amber-600 hover:to-orange-700"
								>
									<>
										{loading ? "Checking access..." : "Access Admin Panel"}
										<ArrowRight className="size-4" />
									</>
								</Button>
							</form>

							<div className="space-y-3 text-center text-sm text-muted-foreground">
								<p>
									This portal is for authorized administrators only. All access
									attempts are logged and monitored.
								</p>
								<div className="flex items-center justify-center gap-4">
									<Link
										to="/login"
										className="font-medium text-foreground transition-colors hover:text-primary"
									>
										User login
									</Link>
									<span className="text-muted-foreground/50">•</span>
									<Link
										to="/"
										className="font-medium text-foreground transition-colors hover:text-primary"
									>
										Back to site
									</Link>
								</div>
							</div>
						</div>
					</SurfaceCard>
				</main>
			</div>
		</div>
	);
}

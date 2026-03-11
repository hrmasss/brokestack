import { Link } from "react-router";

import { BrandBackdrop, SurfaceCard } from "@/components/app/brand";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { NotFoundState } from "@/components/ui/states";

export function NotFoundPage() {
	return (
		<div className="app-shell relative min-h-screen">
			<BrandBackdrop />
			<div className="page-container relative z-10 py-6">
				<Link to="/">
					<Logo size="sm" showText />
				</Link>
				<div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
					<SurfaceCard tone="strong" className="w-full max-w-xl p-8">
						<NotFoundState
							className="min-h-0"
							title="This route is outside the current product map"
							description="Use the public site, dashboard, or sign-in page to continue exploring the redesigned experience."
						/>
						<div className="mt-4 flex justify-center">
							<Button
								asChild
								className="rounded-full bg-gradient-brand text-white border-0"
							>
								<Link to="/">Return home</Link>
							</Button>
						</div>
					</SurfaceCard>
				</div>
			</div>
		</div>
	);
}

import { cn } from "@/lib/utils";

interface LogoProps {
	className?: string;
	showText?: boolean;
	size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
	const sizes = {
		sm: { iconHeight: 28, logoHeight: 28 },
		md: { iconHeight: 34, logoHeight: 34 },
		lg: { iconHeight: 42, logoHeight: 42 },
	};

	const { iconHeight, logoHeight } = sizes[size];

	return (
		<span className={cn("inline-flex items-center", className)}>
			{showText ? (
				<>
					<img
						src="/branding/heimdall-logo-light.png"
						alt="BrokeStack"
						width={960}
						height={203}
						className="h-auto w-auto shrink-0 dark:hidden"
						style={{ height: logoHeight }}
					/>
					<img
						src="/branding/heimdall-logo-dark.png"
						alt="BrokeStack"
						width={960}
						height={203}
						className="hidden h-auto w-auto shrink-0 dark:block"
						style={{ height: logoHeight }}
					/>
				</>
			) : (
				<img
					src="/branding/heimdall-icon-512.png"
					alt="BrokeStack"
					width={512}
					height={512}
					className="h-auto w-auto shrink-0"
					style={{ height: iconHeight }}
				/>
			)}
		</span>
	);
}

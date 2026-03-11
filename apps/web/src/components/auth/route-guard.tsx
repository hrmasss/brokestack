import { Navigate, useLocation } from "react-router";

import { useAuth } from "@/lib/auth-context";

export function CustomerRouteGuard({ children }: { children: React.ReactNode }) {
	const { bootstrapping, customerSession } = useAuth();
	const location = useLocation();

	if (bootstrapping) {
		return <div className="min-h-screen bg-background" />;
	}
	if (!customerSession) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}
	return <>{children}</>;
}

export function PlatformRouteGuard({ children }: { children: React.ReactNode }) {
	const { bootstrapping, platformSession } = useAuth();
	const location = useLocation();

	if (bootstrapping) {
		return <div className="min-h-screen bg-background" />;
	}
	if (!platformSession) {
		return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
	}
	return <>{children}</>;
}

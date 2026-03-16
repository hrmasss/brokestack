import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";

import {
	CustomerRouteGuard,
	PlatformRouteGuard,
} from "@/components/auth/route-guard";
import { applyDocumentSeo, getSeoForPath } from "@/lib/seo";
import { AboutPage } from "@/pages/marketing/about";
import { BlogPage } from "@/pages/marketing/blog";
import { BlogDetailPage } from "@/pages/marketing/blog-detail";
import { FeaturesPage } from "@/pages/marketing/features";
import { HomePage } from "@/pages/marketing/home";
import { MarketingLayout } from "@/pages/marketing/layout";
import { PricingPage } from "@/pages/marketing/pricing";

const LoginPage = lazy(async () =>
	import("@/pages/auth/login").then((module) => ({
		default: module.LoginPage,
	})),
);
const SignupPage = lazy(async () =>
	import("@/pages/auth/signup").then((module) => ({
		default: module.SignupPage,
	})),
);
const DashboardLayout = lazy(async () =>
	import("@/pages/dashboard/layout").then((module) => ({
		default: module.DashboardLayout,
	})),
);
const DashboardOverview = lazy(async () =>
	import("@/pages/dashboard/overview").then((module) => ({
		default: module.DashboardOverview,
	})),
);
const DashboardPosts = lazy(async () =>
	import("@/pages/dashboard/posts").then((module) => ({
		default: module.DashboardPosts,
	})),
);
const DashboardNewPost = lazy(async () =>
	import("@/pages/dashboard/new-post").then((module) => ({
		default: module.DashboardNewPost,
	})),
);
const DashboardCalendar = lazy(async () =>
	import("@/pages/dashboard/calendar").then((module) => ({
		default: module.DashboardCalendar,
	})),
);
const DashboardAnalytics = lazy(async () =>
	import("@/pages/dashboard/analytics").then((module) => ({
		default: module.DashboardAnalytics,
	})),
);
const DashboardAutomations = lazy(async () =>
	import("@/pages/dashboard/automations").then((module) => ({
		default: module.DashboardAutomations,
	})),
);
const DashboardImages = lazy(async () =>
	import("@/pages/dashboard/images").then((module) => ({
		default: module.DashboardImages,
	})),
);
const DashboardImageNew = lazy(async () =>
	import("@/pages/dashboard/image-new").then((module) => ({
		default: module.DashboardImageNew,
	})),
);
const DashboardImageBatch = lazy(async () =>
	import("@/pages/dashboard/image-batch").then((module) => ({
		default: module.DashboardImageBatch,
	})),
);
const DashboardImageConnections = lazy(async () =>
	import("@/pages/dashboard/image-connections").then((module) => ({
		default: module.DashboardImageConnections,
	})),
);
const DashboardImageDetail = lazy(async () =>
	import("@/pages/dashboard/image-detail").then((module) => ({
		default: module.DashboardImageDetail,
	})),
);
const DashboardApi = lazy(async () =>
	import("@/pages/dashboard/api").then((module) => ({
		default: module.DashboardApi,
	})),
);
const DashboardApiDocs = lazy(async () =>
	import("@/pages/dashboard/api-docs").then((module) => ({
		default: module.DashboardApiDocs,
	})),
);
const DashboardLibrary = lazy(async () =>
	import("@/pages/dashboard/library").then((module) => ({
		default: module.DashboardLibrary,
	})),
);
const DashboardTeam = lazy(async () =>
	import("@/pages/dashboard/team").then((module) => ({
		default: module.DashboardTeam,
	})),
);
const DashboardSettings = lazy(async () =>
	import("@/pages/dashboard/settings").then((module) => ({
		default: module.DashboardSettings,
	})),
);
const NotFoundPage = lazy(async () =>
	import("@/pages/not-found").then((module) => ({
		default: module.NotFoundPage,
	})),
);

// Admin pages
const AdminLoginPage = lazy(async () =>
	import("@/pages/admin/login").then((module) => ({
		default: module.AdminLoginPage,
	})),
);
const AdminLayout = lazy(async () =>
	import("@/pages/admin/layout").then((module) => ({
		default: module.AdminLayout,
	})),
);
const AdminOverview = lazy(async () =>
	import("@/pages/admin/overview").then((module) => ({
		default: module.AdminOverview,
	})),
);
const AdminUsers = lazy(async () =>
	import("@/pages/admin/users").then((module) => ({
		default: module.AdminUsers,
	})),
);
const AdminUserCreatePage = lazy(async () =>
	import("@/pages/admin/user-form").then((module) => ({
		default: () => <module.AdminUserFormPage mode="create" />,
	})),
);
const AdminCustomerUserCreatePage = lazy(async () =>
	import("@/pages/admin/customer-user-form").then((module) => ({
		default: module.AdminCustomerUserFormPage,
	})),
);
const AdminUserEditPage = lazy(async () =>
	import("@/pages/admin/user-form").then((module) => ({
		default: () => <module.AdminUserFormPage mode="edit" />,
	})),
);
const AdminUserDetailPage = lazy(async () =>
	import("@/pages/admin/user-detail").then((module) => ({
		default: module.AdminUserDetailPage,
	})),
);
const AdminWorkspaces = lazy(async () =>
	import("@/pages/admin/workspaces").then((module) => ({
		default: module.AdminWorkspaces,
	})),
);
const AdminWorkspaceCreatePage = lazy(async () =>
	import("@/pages/admin/workspace-form").then((module) => ({
		default: () => <module.AdminWorkspaceFormPage mode="create" />,
	})),
);
const AdminWorkspaceEditPage = lazy(async () =>
	import("@/pages/admin/workspace-form").then((module) => ({
		default: () => <module.AdminWorkspaceFormPage mode="edit" />,
	})),
);
const AdminWorkspaceDetailPage = lazy(async () =>
	import("@/pages/admin/workspace-detail").then((module) => ({
		default: module.AdminWorkspaceDetailPage,
	})),
);
const AdminWorkspaceMemberCreatePage = lazy(async () =>
	import("@/pages/admin/workspace-member-form").then((module) => ({
		default: () => <module.AdminWorkspaceMemberFormPage mode="create" />,
	})),
);
const AdminWorkspaceMemberEditPage = lazy(async () =>
	import("@/pages/admin/workspace-member-form").then((module) => ({
		default: () => <module.AdminWorkspaceMemberFormPage mode="edit" />,
	})),
);
const AdminSubscriptions = lazy(async () =>
	import("@/pages/admin/subscriptions").then((module) => ({
		default: module.AdminSubscriptions,
	})),
);
const AdminApiKeys = lazy(async () =>
	import("@/pages/admin/api-keys").then((module) => ({
		default: module.AdminApiKeys,
	})),
);
const AdminBlogPosts = lazy(async () =>
	import("@/pages/admin/blog-posts").then((module) => ({
		default: module.AdminBlogPosts,
	})),
);
const AdminPricingPlans = lazy(async () =>
	import("@/pages/admin/pricing-plans").then((module) => ({
		default: module.AdminPricingPlans,
	})),
);
const AdminSettings = lazy(async () =>
	import("@/pages/admin/settings").then((module) => ({
		default: module.AdminSettings,
	})),
);

function RouteSeoSync() {
	const location = useLocation();

	useEffect(() => {
		applyDocumentSeo(getSeoForPath(location.pathname));
	}, [location.pathname]);

	return null;
}

function RouteFallback() {
	return <div className="min-h-screen bg-background" />;
}

export function AppRoutes() {
	return (
		<>
			<RouteSeoSync />
			<Suspense fallback={<RouteFallback />}>
				<Routes>
					<Route element={<MarketingLayout />}>
						<Route path="/" element={<HomePage />} />
						<Route path="/features" element={<FeaturesPage />} />
						<Route path="/pricing" element={<PricingPage />} />
						<Route path="/about" element={<AboutPage />} />
						<Route path="/blog" element={<BlogPage />} />
						<Route path="/blog/:slug" element={<BlogDetailPage />} />
					</Route>

					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />

					<Route
						path="/dashboard"
						element={
							<CustomerRouteGuard>
								<DashboardLayout />
							</CustomerRouteGuard>
						}
					>
						<Route index element={<DashboardOverview />} />
						<Route path="posts" element={<DashboardPosts />} />
						<Route path="posts/new" element={<DashboardNewPost />} />
						<Route path="calendar" element={<DashboardCalendar />} />
						<Route path="analytics" element={<DashboardAnalytics />} />
						<Route path="images" element={<DashboardImages />} />
						<Route path="images/new" element={<DashboardImageNew />} />
						<Route path="images/batch" element={<DashboardImageBatch />} />
						<Route path="images/connections" element={<DashboardImageConnections />} />
						<Route path="images/:id" element={<DashboardImageDetail />} />
						<Route path="api" element={<DashboardApi />} />
						<Route path="api/docs" element={<DashboardApiDocs />} />
						<Route path="automations" element={<DashboardAutomations />} />
						<Route path="library" element={<DashboardLibrary />} />
						<Route path="team" element={<DashboardTeam />} />
						<Route path="settings" element={<DashboardSettings />} />
					</Route>

					<Route path="/admin/login" element={<AdminLoginPage />} />
					<Route
						path="/admin"
						element={
							<PlatformRouteGuard>
								<AdminLayout />
							</PlatformRouteGuard>
						}
					>
						<Route index element={<AdminOverview />} />
						<Route path="users" element={<AdminUsers />} />
						<Route path="users/new" element={<AdminUserCreatePage />} />
						<Route
							path="users/new/customer"
							element={<AdminCustomerUserCreatePage />}
						/>
						<Route path="users/:id" element={<AdminUserDetailPage />} />
						<Route path="users/:id/edit" element={<AdminUserEditPage />} />
						<Route path="workspaces" element={<AdminWorkspaces />} />
						<Route path="workspaces/new" element={<AdminWorkspaceCreatePage />} />
						<Route path="workspaces/:id" element={<AdminWorkspaceDetailPage />} />
						<Route path="workspaces/:id/edit" element={<AdminWorkspaceEditPage />} />
						<Route
							path="workspaces/:id/members/new"
							element={<AdminWorkspaceMemberCreatePage />}
						/>
						<Route
							path="workspaces/:id/members/:membershipId/edit"
							element={<AdminWorkspaceMemberEditPage />}
						/>
						<Route path="subscriptions" element={<AdminSubscriptions />} />
						<Route path="api-keys" element={<AdminApiKeys />} />
						<Route path="blog-posts" element={<AdminBlogPosts />} />
						<Route path="pricing-plans" element={<AdminPricingPlans />} />
						<Route path="settings" element={<AdminSettings />} />
					</Route>

					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</Suspense>
		</>
	);
}

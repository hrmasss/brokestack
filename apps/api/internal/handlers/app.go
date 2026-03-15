package handlers

import (
	"errors"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"

	"github.com/brokestack/api/internal/auth"
	"github.com/brokestack/api/internal/config"
	"github.com/brokestack/api/internal/iam"
	"github.com/brokestack/api/internal/workerclient"
)

type AppHandler struct {
	service *iam.Service
	cfg     *config.Config
	worker  *workerclient.Client
}

func NewAppHandler(service *iam.Service, cfg *config.Config) *AppHandler {
	return &AppHandler{
		service: service,
		cfg:     cfg,
		worker:  workerclient.New(cfg.Worker),
	}
}

func (h *AppHandler) Register(app *fiber.App) {
	app.Get("/openapi.yaml", ServeOpenAPISpec)
	app.Get("/reference", ServeScalarReference)

	api := app.Group("/api/v1")
	api.Get("/health", HealthCheck)

	api.Post("/auth/register", h.customerRegister)
	api.Post("/auth/login", h.customerLogin)
	api.Post("/auth/refresh", h.customerRefresh)
	api.Post("/auth/logout", h.customerLogout)
	api.Get("/auth/me", h.requireAuth, h.customerMe)

	api.Post("/platform/auth/login", h.platformLogin)
	api.Post("/platform/auth/refresh", h.platformRefresh)
	api.Post("/platform/auth/logout", h.platformLogout)
	api.Get("/platform/me", h.requireAuth, h.platformMe)
	api.Get("/platform/roles", h.requireAuth, h.listPlatformRoles)
	api.Get("/platform/workspace-roles", h.requireAuth, h.listPlatformWorkspaceRoles)
	api.Post("/platform/customer-access", h.requireAuth, h.startPlatformCustomerAccess)

	api.Get("/workspaces", h.requireAuth, h.listWorkspaces)
	api.Post("/workspaces", h.requireAuth, h.createWorkspace)
	api.Get("/workspaces/:id", h.requireAuth, h.getWorkspace)
	api.Patch("/workspaces/:id", h.requireAuth, h.updateWorkspace)
	api.Get("/workspaces/:id/members", h.requireAuth, h.listWorkspaceMembers)
	api.Patch("/workspaces/:id/members/:membershipId", h.requireAuth, h.updateWorkspaceMember)
	api.Get("/workspaces/:id/roles", h.requireAuth, h.listWorkspaceRoles)
	api.Get("/workspaces/:id/invites", h.requireAuth, h.listWorkspaceInvites)
	api.Post("/workspaces/:id/invites", h.requireAuth, h.createWorkspaceInvite)
	api.Delete("/workspaces/:id/invites/:inviteId", h.requireAuth, h.deleteWorkspaceInvite)
	api.Post("/invites/:token/accept", h.requireAuth, h.acceptInvite)
	api.Post("/workspaces/:id/provider-accounts", h.requireAuth, h.createProviderAccount)
	api.Get("/workspaces/:id/provider-accounts", h.requireAuth, h.listProviderAccounts)
	api.Get("/provider-accounts/:id", h.requireAuth, h.getProviderAccount)
	api.Post("/provider-accounts/:id/login-sessions", h.requireAuth, h.startProviderLoginSession)
	api.Get("/provider-accounts/:id/login-sessions/:sessionId", h.requireAuth, h.getProviderLoginSession)
	api.Post("/provider-accounts/:id/login-sessions/:sessionId/refresh-stream", h.requireAuth, h.refreshProviderLoginSessionStream)
	api.Post("/provider-accounts/:id/login-sessions/:sessionId/local-bridge", h.requireAuth, h.startProviderLoginLocalBridge)
	api.Post("/workspaces/:id/automations", h.requireAuth, h.createAutomation)
	api.Get("/workspaces/:id/automations", h.requireAuth, h.listAutomations)
	api.Get("/workspaces/:id/automation-runs", h.requireAuth, h.listWorkspaceAutomationRuns)
	api.Post("/automations/:id/runs", h.requireAuth, h.createAutomationRun)
	api.Get("/automation-runs/:id", h.requireAuth, h.getAutomationRun)
	api.Get("/automation-runs/:id/outputs", h.requireAuth, h.listAutomationRunOutputs)
	api.Get("/automation-run-outputs/:id/content", h.requireAuth, h.getAutomationRunOutputContent)

	api.Post("/platform/users", h.requireAuth, h.createPlatformUser)
	api.Get("/platform/users", h.requireAuth, h.listPlatformUsers)
	api.Get("/platform/users/:id", h.requireAuth, h.getPlatformUser)
	api.Patch("/platform/users/:id", h.requireAuth, h.updatePlatformUser)
	api.Post("/platform/users/:id/impersonate", h.requireAuth, h.impersonatePlatformUser)
	api.Get("/platform/workspaces", h.requireAuth, h.listPlatformWorkspaces)
	api.Post("/platform/workspaces", h.requireAuth, h.createPlatformWorkspace)
	api.Get("/platform/workspaces/:id", h.requireAuth, h.getPlatformWorkspace)
	api.Patch("/platform/workspaces/:id", h.requireAuth, h.updatePlatformWorkspace)
	api.Get("/platform/workspaces/:id/members", h.requireAuth, h.listPlatformWorkspaceMembers)
	api.Post("/platform/workspaces/:id/members", h.requireAuth, h.createPlatformWorkspaceMember)
	api.Patch("/platform/workspaces/:id/members/:membershipId", h.requireAuth, h.updatePlatformWorkspaceMember)
	api.Post("/platform/workspaces/:id/assume-access", h.requireAuth, h.assumeWorkspace)

	app.Post("/api/internal/worker/run-events", h.handleWorkerRunEvent)
	app.Post("/api/internal/worker/browser-events", h.handleWorkerBrowserEvent)
}

func (h *AppHandler) requireAuth(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	c.Locals("principal", principal)
	return c.Next()
}

func (h *AppHandler) customerRegister(c fiber.Ctx) error {
	var body struct {
		FullName      string `json:"fullName"`
		Email         string `json:"email"`
		Password      string `json:"password"`
		WorkspaceName string `json:"workspaceName"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	session, refreshToken, err := h.service.Register(c.Context(), body.FullName, body.Email, body.Password, body.WorkspaceName)
	if err != nil {
		return h.writeError(c, err)
	}
	h.setRefreshCookie(c, auth.PortalCustomer, refreshToken)
	return c.Status(fiber.StatusCreated).JSON(session)
}

func (h *AppHandler) customerLogin(c fiber.Ctx) error {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	session, refreshToken, err := h.service.CustomerLogin(c.Context(), body.Email, body.Password)
	if err != nil {
		return h.writeError(c, err)
	}
	h.setRefreshCookie(c, auth.PortalCustomer, refreshToken)
	return c.JSON(session)
}

func (h *AppHandler) customerRefresh(c fiber.Ctx) error {
	session, refreshToken, err := h.service.RefreshSession(c.Context(), auth.PortalCustomer, c.Cookies(h.cfg.Auth.CustomerCookieName))
	if err != nil {
		return h.writeError(c, err)
	}
	h.setRefreshCookie(c, auth.PortalCustomer, refreshToken)
	return c.JSON(session)
}

func (h *AppHandler) customerLogout(c fiber.Ctx) error {
	if err := h.service.LogoutSession(c.Context(), c.Cookies(h.cfg.Auth.CustomerCookieName)); err != nil {
		return h.writeError(c, err)
	}
	h.clearRefreshCookie(c, auth.PortalCustomer)
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *AppHandler) customerMe(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	session, err := h.service.Me(c.Context(), principal)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(session)
}

func (h *AppHandler) platformLogin(c fiber.Ctx) error {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	session, refreshToken, err := h.service.PlatformLogin(c.Context(), body.Email, body.Password)
	if err != nil {
		return h.writeError(c, err)
	}
	h.setRefreshCookie(c, auth.PortalPlatform, refreshToken)
	return c.JSON(session)
}

func (h *AppHandler) platformRefresh(c fiber.Ctx) error {
	session, refreshToken, err := h.service.RefreshSession(c.Context(), auth.PortalPlatform, c.Cookies(h.cfg.Auth.PlatformCookieName))
	if err != nil {
		return h.writeError(c, err)
	}
	h.setRefreshCookie(c, auth.PortalPlatform, refreshToken)
	return c.JSON(session)
}

func (h *AppHandler) platformLogout(c fiber.Ctx) error {
	if err := h.service.LogoutSession(c.Context(), c.Cookies(h.cfg.Auth.PlatformCookieName)); err != nil {
		return h.writeError(c, err)
	}
	h.clearRefreshCookie(c, auth.PortalPlatform)
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *AppHandler) platformMe(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	session, err := h.service.PlatformMe(c.Context(), principal)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(session)
}

func (h *AppHandler) listPlatformRoles(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListPlatformRoles(c.Context(), principal)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) listPlatformWorkspaceRoles(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListPlatformWorkspaceRoles(c.Context(), principal)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) startPlatformCustomerAccess(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	session, refreshToken, err := h.service.StartPlatformCustomerAccess(c.Context(), principal)
	if err != nil {
		return h.writeError(c, err)
	}
	h.setRefreshCookie(c, auth.PortalCustomer, refreshToken)
	return c.JSON(session)
}

func (h *AppHandler) listWorkspaces(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	workspaces, err := h.service.ListWorkspaces(c.Context(), principal)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": workspaces})
}

func (h *AppHandler) createWorkspace(c fiber.Ctx) error {
	var body struct {
		Name string `json:"name"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	workspace, err := h.service.CreateWorkspace(c.Context(), principal, body.Name)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(workspace)
}

func (h *AppHandler) getWorkspace(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	workspace, err := h.service.GetWorkspace(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(workspace)
}

func (h *AppHandler) updateWorkspace(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		Name   string `json:"name"`
		Status string `json:"status"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	workspace, err := h.service.UpdateWorkspace(c.Context(), principal, workspaceID, body.Name, body.Status)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(workspace)
}

func (h *AppHandler) listWorkspaceMembers(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListWorkspaceMembers(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) updateWorkspaceMember(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	membershipID, err := uuid.Parse(c.Params("membershipId"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		Status    string   `json:"status"`
		RoleCodes []string `json:"roleCodes"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.UpdateWorkspaceMember(c.Context(), principal, workspaceID, membershipID, body.Status, body.RoleCodes)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) listWorkspaceRoles(c fiber.Ctx) error {
	items, err := h.service.ListWorkspaceRoles(c.Context())
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) listWorkspaceInvites(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListWorkspaceInvites(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) createWorkspaceInvite(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		Email     string   `json:"email"`
		RoleCodes []string `json:"roleCodes"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	invite, token, err := h.service.CreateWorkspaceInvite(c.Context(), principal, workspaceID, body.Email, body.RoleCodes)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"invite": invite, "token": token})
}

func (h *AppHandler) deleteWorkspaceInvite(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	inviteID, err := uuid.Parse(c.Params("inviteId"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	if err := h.service.DeleteWorkspaceInvite(c.Context(), principal, workspaceID, inviteID); err != nil {
		return h.writeError(c, err)
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *AppHandler) acceptInvite(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	summary, err := h.service.AcceptInvite(c.Context(), principal, c.Params("token"))
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(summary)
}

func (h *AppHandler) listPlatformUsers(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListPlatformUsers(c.Context(), principal)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) createPlatformUser(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	var body struct {
		FullName  string   `json:"fullName"`
		Email     string   `json:"email"`
		Password  string   `json:"password"`
		Status    string   `json:"status"`
		RoleCodes []string `json:"roleCodes"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	record, err := h.service.CreatePlatformUser(c.Context(), principal, body.FullName, body.Email, body.Password, body.Status, body.RoleCodes)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(record)
}

func (h *AppHandler) getPlatformUser(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	record, err := h.service.GetPlatformUser(c.Context(), principal, userID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) updatePlatformUser(c fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		FullName  string   `json:"fullName"`
		Status    string   `json:"status"`
		RoleCodes []string `json:"roleCodes"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.UpdatePlatformUser(c.Context(), principal, userID, body.FullName, body.Status, body.RoleCodes)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) impersonatePlatformUser(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	session, refreshToken, err := h.service.ImpersonateUser(c.Context(), principal, userID)
	if err != nil {
		return h.writeError(c, err)
	}
	h.setRefreshCookie(c, auth.PortalCustomer, refreshToken)
	return c.JSON(session)
}

func (h *AppHandler) listPlatformWorkspaces(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListPlatformWorkspaces(c.Context(), principal)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) createPlatformWorkspace(c fiber.Ctx) error {
	var body struct {
		Name string `json:"name"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.CreatePlatformWorkspace(c.Context(), principal, body.Name)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(record)
}

func (h *AppHandler) getPlatformWorkspace(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	record, err := h.service.GetPlatformWorkspace(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) updatePlatformWorkspace(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		Name   string `json:"name"`
		Status string `json:"status"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.UpdatePlatformWorkspace(c.Context(), principal, workspaceID, body.Name, body.Status)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) listPlatformWorkspaceMembers(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListPlatformWorkspaceMembers(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) createPlatformWorkspaceMember(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		FullName  string   `json:"fullName"`
		Email     string   `json:"email"`
		Password  string   `json:"password"`
		Status    string   `json:"status"`
		RoleCodes []string `json:"roleCodes"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	record, err := h.service.CreatePlatformWorkspaceMember(c.Context(), principal, workspaceID, body.FullName, body.Email, body.Password, body.Status, body.RoleCodes)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(record)
}

func (h *AppHandler) updatePlatformWorkspaceMember(c fiber.Ctx) error {
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	membershipID, err := uuid.Parse(c.Params("membershipId"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		Status    string   `json:"status"`
		RoleCodes []string `json:"roleCodes"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	record, err := h.service.UpdatePlatformWorkspaceMember(c.Context(), principal, workspaceID, membershipID, body.Status, body.RoleCodes)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) assumeWorkspace(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	session, refreshToken, err := h.service.AssumeWorkspace(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	h.setRefreshCookie(c, auth.PortalCustomer, refreshToken)
	return c.JSON(session)
}

func (h *AppHandler) principal(c fiber.Ctx) (*iam.Principal, error) {
	if principal, ok := c.Locals("principal").(*iam.Principal); ok && principal != nil {
		return principal, nil
	}

	header := strings.TrimSpace(c.Get("Authorization"))
	if header == "" {
		return nil, iam.ErrUnauthorized
	}

	token := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
	if token == header {
		token = strings.TrimSpace(strings.TrimPrefix(header, "Bearer"))
	}
	if token == "" || token == header {
		return nil, iam.ErrUnauthorized
	}

	principal, err := h.service.BuildPrincipal(token)
	if err != nil {
		return nil, err
	}
	c.Locals("principal", principal)
	return principal, nil
}

func (h *AppHandler) setRefreshCookie(c fiber.Ctx, portal, token string) {
	name := h.cfg.Auth.CustomerCookieName
	if portal == auth.PortalPlatform {
		name = h.cfg.Auth.PlatformCookieName
	}
	c.Cookie(&fiber.Cookie{
		Name:     name,
		Value:    token,
		HTTPOnly: true,
		Secure:   h.cfg.Auth.CookieSecure,
		SameSite: fiber.CookieSameSiteLaxMode,
		Path:     "/",
		Expires:  time.Now().UTC().Add(h.cfg.Auth.RefreshTokenTTL),
	})
}

func (h *AppHandler) clearRefreshCookie(c fiber.Ctx, portal string) {
	name := h.cfg.Auth.CustomerCookieName
	if portal == auth.PortalPlatform {
		name = h.cfg.Auth.PlatformCookieName
	}
	c.Cookie(&fiber.Cookie{
		Name:     name,
		Value:    "",
		HTTPOnly: true,
		Secure:   h.cfg.Auth.CookieSecure,
		SameSite: fiber.CookieSameSiteLaxMode,
		Path:     "/",
		Expires:  time.Unix(0, 0),
	})
}

func (h *AppHandler) writeError(c fiber.Ctx, err error) error {
	status := fiber.StatusInternalServerError
	switch {
	case errors.Is(err, iam.ErrUnauthorized):
		status = fiber.StatusUnauthorized
	case errors.Is(err, iam.ErrForbidden):
		status = fiber.StatusForbidden
	case errors.Is(err, iam.ErrNotFound):
		status = fiber.StatusNotFound
	case errors.Is(err, iam.ErrConflict), errors.Is(err, iam.ErrLastWorkspaceOwner):
		status = fiber.StatusConflict
	case errors.Is(err, iam.ErrValidation):
		status = fiber.StatusBadRequest
	}
	if status >= fiber.StatusInternalServerError {
		log.Printf("request failed: %s %s: %v", c.Method(), c.OriginalURL(), err)
	}
	return c.Status(status).JSON(fiber.Map{
		"error":   true,
		"message": err.Error(),
	})
}

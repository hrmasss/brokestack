package handlers

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"

	"github.com/brokestack/api/internal/iam"
	"github.com/brokestack/api/internal/workerclient"
)

func (h *AppHandler) createProviderAccount(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		Provider string `json:"provider"`
		Label    string `json:"label"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.CreateProviderAccount(c.Context(), principal, workspaceID, body.Provider, body.Label)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(record)
}

func (h *AppHandler) listProviderAccounts(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListProviderAccounts(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) getProviderAccount(c fiber.Ctx) error {
	accountID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.GetProviderAccount(c.Context(), principal, accountID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) startProviderLoginSession(c fiber.Ctx) error {
	accountID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	session, account, err := h.service.StartProviderLoginSession(c.Context(), principal, accountID)
	if err != nil {
		return h.writeError(c, err)
	}

	workerResponse, err := h.worker.StartLoginSession(c.Context(), workerclient.StartLoginSessionRequest{
		LoginSessionID:    session.ID,
		ProviderAccountID: account.ID.String(),
		WorkspaceID:       account.WorkspaceID.String(),
		Provider:          account.Provider,
		ProfileKey:        account.ProfileKey,
	})
	if err != nil {
		return h.writeError(c, fmt.Errorf("%w: unable to start browser login session", err))
	}

	if err := h.service.SetProviderLoginSessionWorkerID(c.Context(), mustParseID(session.ID), workerResponse.WorkerSessionID); err != nil {
		return h.writeError(c, err)
	}
	session.WorkerSessionID = workerResponse.WorkerSessionID
	if workerResponse.Status != "" {
		session.Status = workerResponse.Status
	}

	return c.Status(fiber.StatusCreated).JSON(session)
}

func (h *AppHandler) getProviderLoginSession(c fiber.Ctx) error {
	accountID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	sessionID, err := uuid.Parse(c.Params("sessionId"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.GetProviderLoginSession(c.Context(), principal, accountID, sessionID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) createAutomation(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		Name              string               `json:"name"`
		ProviderAccountID string               `json:"providerAccountId"`
		Config            iam.AutomationConfig `json:"config"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	providerAccountID, err := uuid.Parse(strings.TrimSpace(body.ProviderAccountID))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.CreateAutomation(c.Context(), principal, workspaceID, providerAccountID, body.Name, body.Config)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(record)
}

func (h *AppHandler) listAutomations(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListAutomations(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) listWorkspaceAutomationRuns(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListAutomationRuns(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) createAutomationRun(c fiber.Ctx) error {
	automationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		PromptText string `json:"promptText"`
	}
	if err := c.Bind().JSON(&body); err != nil && !errors.Is(err, fiber.ErrUnprocessableEntity) {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	dispatch, err := h.service.CreateAutomationRun(c.Context(), principal, automationID, body.PromptText)
	if err != nil {
		return h.writeError(c, err)
	}

	workerResponse, err := h.worker.StartAutomationRun(c.Context(), workerclient.StartAutomationRunRequest{
		RunID:             dispatch.Run.ID,
		AutomationID:      dispatch.Run.AutomationID,
		ProviderAccountID: dispatch.Account.ID,
		WorkspaceID:       dispatch.Run.WorkspaceID,
		Provider:          dispatch.Account.Provider,
		ProfileKey:        dispatch.Account.ProfileKey,
		PromptText:        dispatch.Run.PromptText,
		Config: map[string]any{
			"promptTemplate": dispatch.Config.PromptTemplate,
			"imageCount":     dispatch.Config.ImageCount,
			"aspectRatio":    dispatch.Config.AspectRatio,
			"provider":       dispatch.Config.Provider,
		},
	})
	if err != nil {
		return h.writeError(c, fmt.Errorf("%w: unable to enqueue automation run", err))
	}

	if err := h.service.SetAutomationRunWorkerID(c.Context(), mustParseID(dispatch.Run.ID), workerResponse.WorkerRunID); err != nil {
		return h.writeError(c, err)
	}
	dispatch.Run.WorkerRunID = workerResponse.WorkerRunID
	if workerResponse.Status != "" {
		dispatch.Run.Status = workerResponse.Status
	}
	return c.Status(fiber.StatusCreated).JSON(dispatch.Run)
}

func (h *AppHandler) getAutomationRun(c fiber.Ctx) error {
	runID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.GetAutomationRun(c.Context(), principal, runID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) listAutomationRunOutputs(c fiber.Ctx) error {
	runID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListAutomationRunOutputs(c.Context(), principal, runID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) getAutomationRunOutputContent(c fiber.Ctx) error {
	outputID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.GetAutomationRunOutput(c.Context(), principal, outputID)
	if err != nil {
		return h.writeError(c, err)
	}

	path, err := h.resolveOutputPath(record.StoragePath)
	if err != nil {
		return h.writeError(c, err)
	}
	if _, err := os.Stat(path); err != nil {
		return h.writeError(c, iam.ErrNotFound)
	}

	c.Type(record.MimeType)
	c.Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s\"", filepath.Base(path)))
	return c.SendFile(path)
}

func (h *AppHandler) handleWorkerRunEvent(c fiber.Ctx) error {
	if strings.TrimSpace(c.Get("X-Worker-Secret")) != h.cfg.Worker.SharedSecret {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   true,
			"message": "unauthorized",
		})
	}

	var payload iam.WorkerRunEventPayload
	if err := c.Bind().JSON(&payload); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	if err := h.service.HandleWorkerEvent(c.Context(), payload); err != nil {
		return h.writeError(c, err)
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *AppHandler) resolveOutputPath(storagePath string) (string, error) {
	resolved := storagePath
	primaryBase := strings.TrimSpace(h.cfg.Storage.RootDir)
	if primaryBase == "" {
		primaryBase = "."
	}
	primaryBaseAbs, err := filepath.Abs(primaryBase)
	if err != nil {
		return "", err
	}

	if !filepath.IsAbs(resolved) {
		resolved = filepath.Join(primaryBaseAbs, resolved)
	}
	resolvedAbs, err := filepath.Abs(resolved)
	if err != nil {
		return "", err
	}

	allowedBases := []string{primaryBaseAbs}
	if workerOutputsBase := strings.TrimSpace(h.cfg.Storage.WorkerOutputsDir); workerOutputsBase != "" {
		workerOutputsAbs, err := filepath.Abs(workerOutputsBase)
		if err != nil {
			return "", err
		}
		allowedBases = append(allowedBases, workerOutputsAbs)
	}

	for _, baseAbs := range allowedBases {
		if resolvedAbs == baseAbs || strings.HasPrefix(resolvedAbs, baseAbs+string(os.PathSeparator)) {
			return resolvedAbs, nil
		}
	}
	return "", iam.ErrForbidden
}

func mustParseID(value string) uuid.UUID {
	parsed, err := uuid.Parse(value)
	if err != nil {
		return uuid.Nil
	}
	return parsed
}

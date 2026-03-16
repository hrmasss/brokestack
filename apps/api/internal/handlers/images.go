package handlers

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"

	"github.com/brokestack/api/internal/database"
	"github.com/brokestack/api/internal/iam"
	"github.com/brokestack/api/internal/workerclient"
)

func (h *AppHandler) listWorkspaceImageJobs(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListImageJobs(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) createWorkspaceImageJob(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		ProviderAccountID string `json:"providerAccountId"`
		Title             string `json:"title"`
		PromptText        string `json:"promptText"`
		AspectRatio       string `json:"aspectRatio"`
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
	dispatch, err := h.service.CreateImageJob(c.Context(), principal, workspaceID, providerAccountID, body.Title, body.PromptText, body.AspectRatio)
	if err != nil {
		return h.writeError(c, err)
	}
	if err := h.enqueueImageJob(c.Context(), dispatch); err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(dispatch.Job)
}

func (h *AppHandler) createWorkspaceImageBatch(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		ProviderAccountID string   `json:"providerAccountId"`
		Title             string   `json:"title"`
		PromptTemplate    string   `json:"promptTemplate"`
		PlaceholderName   string   `json:"placeholderName"`
		AspectRatio       string   `json:"aspectRatio"`
		Values            []string `json:"values"`
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
	result, dispatches, err := h.service.CreateImageBatch(c.Context(), principal, workspaceID, providerAccountID, body.Title, body.PromptTemplate, body.PlaceholderName, body.AspectRatio, body.Values)
	if err != nil {
		return h.writeError(c, err)
	}
	for _, dispatch := range dispatches {
		if err := h.enqueueImageJob(c.Context(), &dispatch); err != nil {
			return h.writeError(c, err)
		}
	}
	return c.Status(fiber.StatusCreated).JSON(result)
}

func (h *AppHandler) getImageJob(c fiber.Ctx) error {
	jobID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.GetImageJob(c.Context(), principal, jobID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) listImageOutputs(c fiber.Ctx) error {
	jobID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListImageOutputs(c.Context(), principal, jobID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) getImageOutputContent(c fiber.Ctx) error {
	outputID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.GetImageOutput(c.Context(), principal, outputID)
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

func (h *AppHandler) updateProviderAccountImageSettings(c fiber.Ctx) error {
	accountID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		CooldownSeconds  int  `json:"cooldownSeconds"`
		JitterMinSeconds int  `json:"jitterMinSeconds"`
		JitterMaxSeconds int  `json:"jitterMaxSeconds"`
		IsDefaultForAPI  bool `json:"isDefaultForApi"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.UpdateProviderAccountImageSettings(
		c.Context(),
		principal,
		accountID,
		body.CooldownSeconds,
		body.JitterMinSeconds,
		body.JitterMaxSeconds,
		body.IsDefaultForAPI,
	)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) listWorkspaceAPIKeys(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	items, err := h.service.ListWorkspaceAPIKeys(c.Context(), principal, workspaceID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) createWorkspaceAPIKey(c fiber.Ctx) error {
	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	var body struct {
		Name              string   `json:"name"`
		Scopes            []string `json:"scopes"`
		RequestsPerMinute int      `json:"requestsPerMinute"`
		DailyImageQuota   int      `json:"dailyImageQuota"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.CreateWorkspaceAPIKey(c.Context(), principal, workspaceID, body.Name, body.Scopes, body.RequestsPerMinute, body.DailyImageQuota)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(record)
}

func (h *AppHandler) revokeWorkspaceAPIKey(c fiber.Ctx) error {
	keyID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}
	record, err := h.service.RevokeWorkspaceAPIKey(c.Context(), principal, keyID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) publicCreateImageJob(c fiber.Ctx) error {
	key, err := h.workspaceAPIKeyFromRequest(c)
	if err != nil {
		return h.writeError(c, err)
	}
	var body struct {
		Title       string `json:"title"`
		PromptText  string `json:"promptText"`
		AspectRatio string `json:"aspectRatio"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	dispatch, err := h.service.CreateAPIImageJob(c.Context(), key, c.IP(), body.Title, body.PromptText, body.AspectRatio)
	if err != nil {
		return h.writeError(c, err)
	}
	if err := h.enqueueImageJob(c.Context(), dispatch); err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(dispatch.Job)
}

func (h *AppHandler) publicCreateImageBatch(c fiber.Ctx) error {
	key, err := h.workspaceAPIKeyFromRequest(c)
	if err != nil {
		return h.writeError(c, err)
	}
	var body struct {
		Title           string   `json:"title"`
		PromptTemplate  string   `json:"promptTemplate"`
		PlaceholderName string   `json:"placeholderName"`
		AspectRatio     string   `json:"aspectRatio"`
		Values          []string `json:"values"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	result, dispatches, err := h.service.CreateAPIImageBatch(c.Context(), key, c.IP(), body.Title, body.PromptTemplate, body.PlaceholderName, body.AspectRatio, body.Values)
	if err != nil {
		return h.writeError(c, err)
	}
	for _, dispatch := range dispatches {
		if err := h.enqueueImageJob(c.Context(), &dispatch); err != nil {
			return h.writeError(c, err)
		}
	}
	return c.Status(fiber.StatusCreated).JSON(result)
}

func (h *AppHandler) publicGetImageJob(c fiber.Ctx) error {
	key, err := h.workspaceAPIKeyFromRequest(c)
	if err != nil {
		return h.writeError(c, err)
	}
	jobID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	record, err := h.service.GetAPIImageJob(c.Context(), key, jobID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(record)
}

func (h *AppHandler) publicListImageOutputs(c fiber.Ctx) error {
	key, err := h.workspaceAPIKeyFromRequest(c)
	if err != nil {
		return h.writeError(c, err)
	}
	jobID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	items, err := h.service.ListAPIImageOutputs(c.Context(), key, jobID)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.JSON(fiber.Map{"items": items})
}

func (h *AppHandler) workspaceAPIKeyFromRequest(c fiber.Ctx) (*database.WorkspaceAPIKey, error) {
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
	return h.service.AuthenticateWorkspaceAPIKey(c.Context(), token)
}

func (h *AppHandler) enqueueImageJob(ctx context.Context, dispatch *iam.ImageJobDispatch) error {
	workerResponse, err := h.worker.StartImageJob(ctx, workerclient.StartImageJobRequest{
		RunID:             dispatch.Job.ID,
		ProviderAccountID: dispatch.Account.ID,
		WorkspaceID:       dispatch.Job.WorkspaceID,
		Provider:          dispatch.Account.Provider,
		ProfileKey:        dispatch.Account.ProfileKey,
		PromptText:        dispatch.Job.PromptText,
		Config: map[string]any{
			"title":            dispatch.Job.Title,
			"aspectRatio":      dispatch.Job.AspectRatio,
			"source":           dispatch.Job.Source,
			"requestType":      dispatch.Job.RequestType,
			"cooldownSeconds":  dispatch.Account.CooldownSeconds,
			"jitterMinSeconds": dispatch.Account.JitterMinSeconds,
			"jitterMaxSeconds": dispatch.Account.JitterMaxSeconds,
		},
	})
	if err != nil {
		return fmt.Errorf("%w: unable to enqueue image job", err)
	}
	if strings.TrimSpace(workerResponse.WorkerRunID) != "" {
		if jobID, parseErr := uuid.Parse(dispatch.Job.ID); parseErr == nil {
			if err := h.service.SetImageJobWorkerState(ctx, jobID, workerResponse.WorkerRunID, workerResponse.Status); err != nil {
				return err
			}
		}
	}
	return nil
}

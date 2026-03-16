package handlers

import (
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"

	"github.com/brokestack/api/internal/iam"
)

func (h *AppHandler) createE2EProviderFixture(c fiber.Ctx) error {
	if h.cfg.Environment == "production" {
		return h.writeError(c, iam.ErrNotFound)
	}

	workspaceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return h.writeError(c, iam.ErrValidation)
	}
	principal, err := h.principal(c)
	if err != nil {
		return h.writeError(c, err)
	}

	var body struct {
		Label               string `json:"label"`
		IncludeLoginSession bool   `json:"includeLoginSession"`
		StreamURL           string `json:"streamUrl"`
	}
	if err := c.Bind().JSON(&body); err != nil && err != fiber.ErrUnprocessableEntity {
		return h.writeError(c, iam.ErrValidation)
	}

	record, err := h.service.CreateE2EProviderFixture(
		c.Context(),
		principal,
		workspaceID,
		body.Label,
		body.IncludeLoginSession,
		body.StreamURL,
	)
	if err != nil {
		return h.writeError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(record)
}

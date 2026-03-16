package iam

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/brokestack/api/internal/database"
)

type E2EProviderFixtureRecord struct {
	Account      ProviderAccountRecord       `json:"account"`
	LoginSession *ProviderLoginSessionRecord `json:"loginSession,omitempty"`
}

func (s *Service) CreateE2EProviderFixture(
	ctx context.Context,
	principal *Principal,
	workspaceID uuid.UUID,
	label string,
	includeLoginSession bool,
	streamURL string,
) (*E2EProviderFixtureRecord, error) {
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, workspaceID, "images.manage", "automations.manage"); err != nil {
		return nil, err
	}

	label = strings.TrimSpace(label)
	if label == "" {
		label = "E2E ChatGPT"
	}

	accountRecord, err := s.CreateProviderAccount(ctx, principal, workspaceID, "chatgpt", label)
	if err != nil {
		return nil, err
	}

	accountID, err := uuid.Parse(accountRecord.ID)
	if err != nil {
		return nil, err
	}
	account, err := s.findProviderAccountByID(ctx, accountID)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	if _, err := s.db.NewUpdate().
		Model((*database.ProviderAccount)(nil)).
		Set("is_default_for_api = ?", false).
		Set("updated_at = ?", now).
		Where("workspace_id = ?", workspaceID).
		Exec(ctx); err != nil {
		return nil, err
	}
	account.Status = accountStatusReady
	account.LastValidatedAt = &now
	account.LastError = ""
	account.IsDefaultForAPI = true
	account.UpdatedAt = now
	if _, err := s.db.NewUpdate().
		Model(account).
		Column("status", "last_validated_at", "last_error", "is_default_for_api", "updated_at").
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}

	record := &E2EProviderFixtureRecord{
		Account: providerAccountRecordFromModel(*account),
	}
	if !includeLoginSession {
		return record, nil
	}

	if strings.TrimSpace(streamURL) == "" {
		streamURL = fmt.Sprintf("http://%s:%s/reference", s.cfg.API.Host, s.cfg.API.Port)
	}

	loginSession := &database.ProviderLoginSession{
		ID:                 uuid.New(),
		ProviderAccountID:  account.ID,
		WorkspaceID:        workspaceID,
		ConnectionMode:     connectionModeRemoteBrowser,
		SessionStatus:      loginSessionStatusReadyForUser,
		Status:             accountStatusBusy,
		BrowserInstanceID:  uuid.NewString(),
		StreamSessionToken: uuid.NewString(),
		StreamURL:          streamURL,
		FallbackRequired:   false,
		WorkerSessionID:    uuid.NewString(),
		StartedAt:          now,
		ExpiresAt:          now.Add(30 * time.Minute),
		LastError:          "",
	}
	if _, err := s.db.NewInsert().Model(loginSession).Exec(ctx); err != nil {
		return nil, err
	}

	account.Status = accountStatusBusy
	account.UpdatedAt = now
	if _, err := s.db.NewUpdate().
		Model(account).
		Column("status", "updated_at").
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}

	sessionRecord := providerLoginSessionRecordFromModel(*loginSession)
	record.Account = providerAccountRecordFromModel(*account)
	record.LoginSession = &sessionRecord
	return record, nil
}

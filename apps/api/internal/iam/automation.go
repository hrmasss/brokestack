package iam

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/brokestack/api/internal/database"
)

const (
	automationKindImageGeneration = "image_generation"
	connectionModeRemoteBrowser   = "remote_browser"
	connectionModeLocalBridge     = "local_bridge"

	accountStatusPendingLogin = "pending_login"
	accountStatusReady        = "ready"
	accountStatusNeedsReauth  = "needs_reauth"
	accountStatusBusy         = "busy"
	accountStatusError        = "error"

	loginSessionStatusQueued         = "queued"
	loginSessionStatusLaunching      = "launching"
	loginSessionStatusReadyForUser   = "ready_for_user"
	loginSessionStatusAuthInProgress = "auth_in_progress"
	loginSessionStatusReady          = "ready"
	loginSessionStatusFailed         = "failed"
	loginSessionStatusExpired        = "expired"

	browserInstanceStatusLaunching      = "launching"
	browserInstanceStatusReadyForUser   = "ready_for_user"
	browserInstanceStatusAuthInProgress = "auth_in_progress"
	browserInstanceStatusReady          = "ready"
	browserInstanceStatusClosed         = "closed"
	browserInstanceStatusFailed         = "failed"

	runStatusQueued           = "queued"
	runStatusStarting         = "starting"
	runStatusAwaitingLogin    = "awaiting_login"
	runStatusNavigating       = "navigating"
	runStatusSubmittingPrompt = "submitting_prompt"
	runStatusGenerating       = "generating"
	runStatusDownloading      = "downloading"
	runStatusCompleted        = "completed"
	runStatusFailed           = "failed"
)

type AutomationConfig struct {
	PromptTemplate string `json:"promptTemplate"`
	ImageCount     int    `json:"imageCount"`
	AspectRatio    string `json:"aspectRatio,omitempty"`
	Provider       string `json:"provider"`
}

type ProviderAccountRecord struct {
	ID               string `json:"id"`
	WorkspaceID      string `json:"workspaceId"`
	Provider         string `json:"provider"`
	Label            string `json:"label"`
	Status           string `json:"status"`
	ProfileKey       string `json:"profileKey"`
	CooldownSeconds  int    `json:"cooldownSeconds"`
	JitterMinSeconds int    `json:"jitterMinSeconds"`
	JitterMaxSeconds int    `json:"jitterMaxSeconds"`
	IsDefaultForAPI  bool   `json:"isDefaultForApi"`
	LastValidatedAt  string `json:"lastValidatedAt,omitempty"`
	LastError        string `json:"lastError,omitempty"`
	CreatedAt        string `json:"createdAt"`
	UpdatedAt        string `json:"updatedAt"`
}

type ProviderLoginSessionRecord struct {
	ID                 string `json:"id"`
	ProviderAccountID  string `json:"providerAccountId"`
	WorkspaceID        string `json:"workspaceId"`
	ConnectionMode     string `json:"connectionMode"`
	SessionStatus      string `json:"sessionStatus"`
	Status             string `json:"status"`
	BrowserInstanceID  string `json:"browserInstanceId,omitempty"`
	StreamSessionToken string `json:"streamSessionToken,omitempty"`
	StreamURL          string `json:"streamUrl,omitempty"`
	FallbackRequired   bool   `json:"fallbackRequired"`
	WorkerSessionID    string `json:"workerSessionId,omitempty"`
	StartedAt          string `json:"startedAt"`
	CompletedAt        string `json:"completedAt,omitempty"`
	ExpiresAt          string `json:"expiresAt"`
	LastError          string `json:"lastError,omitempty"`
}

type BrowserInstanceRecord struct {
	ID                string `json:"id"`
	WorkspaceID       string `json:"workspaceId"`
	ProviderAccountID string `json:"providerAccountId"`
	Provider          string `json:"provider"`
	Status            string `json:"status"`
	RuntimeType       string `json:"runtimeType"`
	ProfileMountPath  string `json:"profileMountPath"`
	StartedAt         string `json:"startedAt"`
	EndedAt           string `json:"endedAt,omitempty"`
	LastHeartbeatAt   string `json:"lastHeartbeatAt,omitempty"`
	Region            string `json:"region,omitempty"`
	NodeName          string `json:"nodeName,omitempty"`
	LastError         string `json:"lastError,omitempty"`
}

type LocalBridgeSessionRecord struct {
	ID                     string `json:"id"`
	ProviderLoginSessionID string `json:"providerLoginSessionId"`
	WorkspaceID            string `json:"workspaceId"`
	Status                 string `json:"status"`
	ChallengeToken         string `json:"challengeToken"`
	ConnectedAt            string `json:"connectedAt,omitempty"`
	CompletedAt            string `json:"completedAt,omitempty"`
	LastError              string `json:"lastError,omitempty"`
	CreatedAt              string `json:"createdAt"`
}

type AutomationRecord struct {
	ID                string               `json:"id"`
	WorkspaceID       string               `json:"workspaceId"`
	Kind              string               `json:"kind"`
	ProviderAccountID string               `json:"providerAccountId"`
	Name              string               `json:"name"`
	Status            string               `json:"status"`
	Config            AutomationConfig     `json:"config"`
	CreatedAt         string               `json:"createdAt"`
	UpdatedAt         string               `json:"updatedAt"`
	LastRun           *AutomationRunRecord `json:"lastRun,omitempty"`
}

type AutomationRunRecord struct {
	ID                string `json:"id"`
	AutomationID      string `json:"automationId"`
	WorkspaceID       string `json:"workspaceId"`
	Status            string `json:"status"`
	PromptText        string `json:"promptText"`
	WorkerRunID       string `json:"workerRunId,omitempty"`
	ProviderThreadURL string `json:"providerThreadUrl,omitempty"`
	ProviderThreadID  string `json:"providerThreadId,omitempty"`
	QueuedAt          string `json:"queuedAt"`
	StartedAt         string `json:"startedAt,omitempty"`
	CompletedAt       string `json:"completedAt,omitempty"`
	LastError         string `json:"lastError,omitempty"`
}

type AutomationRunOutputRecord struct {
	ID               string `json:"id"`
	RunID            string `json:"runId"`
	WorkspaceID      string `json:"workspaceId"`
	StoragePath      string `json:"storagePath"`
	MimeType         string `json:"mimeType"`
	ByteSize         int64  `json:"byteSize"`
	Width            int    `json:"width"`
	Height           int    `json:"height"`
	SHA256           string `json:"sha256"`
	ProviderAssetURL string `json:"providerAssetUrl,omitempty"`
	CreatedAt        string `json:"createdAt"`
	ContentURL       string `json:"contentUrl"`
}

type AutomationRunDispatch struct {
	Run     AutomationRunRecord
	Account ProviderAccountRecord
	Config  AutomationConfig
}

type WorkerEventPayload struct {
	EventID            string                  `json:"eventId"`
	EventType          string                  `json:"eventType"`
	ProviderAccountID  string                  `json:"providerAccountId,omitempty"`
	LoginSessionID     string                  `json:"loginSessionId,omitempty"`
	RunID              string                  `json:"runId,omitempty"`
	WorkerRunID        string                  `json:"workerRunId,omitempty"`
	BrowserInstanceID  string                  `json:"browserInstanceId,omitempty"`
	Status             string                  `json:"status,omitempty"`
	SessionStatus      string                  `json:"sessionStatus,omitempty"`
	ConnectionMode     string                  `json:"connectionMode,omitempty"`
	Message            string                  `json:"message,omitempty"`
	StreamSessionToken string                  `json:"streamSessionToken,omitempty"`
	StreamURL          string                  `json:"streamUrl,omitempty"`
	FallbackRequired   bool                    `json:"fallbackRequired,omitempty"`
	RuntimeType        string                  `json:"runtimeType,omitempty"`
	ProfileMountPath   string                  `json:"profileMountPath,omitempty"`
	Region             string                  `json:"region,omitempty"`
	NodeName           string                  `json:"nodeName,omitempty"`
	ProviderThreadURL  string                  `json:"providerThreadUrl,omitempty"`
	ProviderThreadID   string                  `json:"providerThreadId,omitempty"`
	Output             *WorkerRunOutputPayload `json:"output,omitempty"`
}

type WorkerRunOutputPayload struct {
	ID               string `json:"id,omitempty"`
	StoragePath      string `json:"storagePath"`
	MimeType         string `json:"mimeType"`
	ByteSize         int64  `json:"byteSize"`
	Width            int    `json:"width"`
	Height           int    `json:"height"`
	SHA256           string `json:"sha256"`
	ProviderAssetURL string `json:"providerAssetUrl,omitempty"`
}

func (s *Service) CreateProviderAccount(ctx context.Context, principal *Principal, workspaceID uuid.UUID, provider, label string) (*ProviderAccountRecord, error) {
	if _, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "automations.manage"); err != nil {
		return nil, err
	}

	provider = strings.ToLower(strings.TrimSpace(provider))
	label = strings.TrimSpace(label)
	if provider == "" {
		return nil, fmt.Errorf("%w: provider is required", ErrValidation)
	}
	if label == "" {
		label = strings.ToUpper(provider[:1]) + provider[1:]
	}

	account := &database.ProviderAccount{
		ID:               uuid.New(),
		WorkspaceID:      workspaceID,
		Provider:         provider,
		Label:            label,
		Status:           accountStatusPendingLogin,
		CooldownSeconds:  60,
		JitterMinSeconds: 5,
		JitterMaxSeconds: 20,
		CreatedAt:        time.Now().UTC(),
		UpdatedAt:        time.Now().UTC(),
	}
	existingAccounts, err := s.db.NewSelect().
		Model((*database.ProviderAccount)(nil)).
		Where("workspace_id = ?", workspaceID).
		Count(ctx)
	if err != nil {
		return nil, err
	}
	account.IsDefaultForAPI = existingAccounts == 0
	account.ProfileKey = s.ensureProviderProfileKey(ctx, workspaceID, provider, label)
	if _, err := s.db.NewInsert().Model(account).Exec(ctx); err != nil {
		return nil, err
	}

	if err := s.insertAuditLog(ctx, &principal.UserID, "provider_account.created", "provider_account", account.ID.String(), &workspaceID, map[string]any{
		"provider": provider,
		"label":    label,
	}); err != nil {
		return nil, err
	}

	record := providerAccountRecordFromModel(*account)
	return &record, nil
}

func (s *Service) ListProviderAccounts(ctx context.Context, principal *Principal, workspaceID uuid.UUID) ([]ProviderAccountRecord, error) {
	if _, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "automations.view"); err != nil {
		return nil, err
	}

	var accounts []database.ProviderAccount
	if err := s.db.NewSelect().
		Model(&accounts).
		Where("workspace_id = ?", workspaceID).
		OrderExpr("created_at ASC").
		Scan(ctx); err != nil {
		return nil, err
	}

	items := make([]ProviderAccountRecord, 0, len(accounts))
	for _, account := range accounts {
		items = append(items, providerAccountRecordFromModel(account))
	}
	return items, nil
}

func (s *Service) GetProviderAccount(ctx context.Context, principal *Principal, accountID uuid.UUID) (*ProviderAccountRecord, error) {
	account, err := s.findProviderAccountByID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspaceAccess(ctx, principal, account.WorkspaceID, "automations.view"); err != nil {
		return nil, err
	}
	record := providerAccountRecordFromModel(*account)
	return &record, nil
}

func (s *Service) StartProviderLoginSession(ctx context.Context, principal *Principal, accountID uuid.UUID) (*ProviderLoginSessionRecord, *database.ProviderAccount, error) {
	account, err := s.findProviderAccountByID(ctx, accountID)
	if err != nil {
		return nil, nil, err
	}
	if _, err := s.requireWorkspaceAccess(ctx, principal, account.WorkspaceID, "automations.manage"); err != nil {
		return nil, nil, err
	}
	if _, err := s.findActiveProviderLoginSession(ctx, account.ID); err == nil {
		return nil, nil, fmt.Errorf("%w: provider login session is already active", ErrConflict)
	} else if !errors.Is(err, ErrNotFound) {
		return nil, nil, err
	}

	now := time.Now().UTC()
	accountStatus := accountStatusPendingLogin
	if account.Status == accountStatusReady || account.Status == accountStatusBusy || account.LastValidatedAt != nil {
		accountStatus = accountStatusBusy
	}
	session := &database.ProviderLoginSession{
		ID:                uuid.New(),
		ProviderAccountID: account.ID,
		WorkspaceID:       account.WorkspaceID,
		ConnectionMode:    connectionModeRemoteBrowser,
		SessionStatus:     loginSessionStatusLaunching,
		Status:            accountStatusPendingLogin,
		FallbackRequired:  false,
		StartedAt:         now,
		ExpiresAt:         now.Add(30 * time.Minute),
	}
	account.Status = accountStatus
	account.LastError = ""
	account.UpdatedAt = now

	if _, err := s.db.NewInsert().Model(session).Exec(ctx); err != nil {
		return nil, nil, err
	}
	if _, err := s.db.NewUpdate().
		Model(account).
		Column("status", "last_error", "updated_at").
		WherePK().
		Exec(ctx); err != nil {
		return nil, nil, err
	}

	record := providerLoginSessionRecordFromModel(*session)
	return &record, account, nil
}

func (s *Service) SyncProviderLoginSessionWorkerState(
	ctx context.Context,
	sessionID uuid.UUID,
	workerSessionID string,
	browserInstanceID string,
	sessionStatus string,
	status string,
	streamSessionToken string,
	streamURL string,
	profileMountPath string,
	runtimeType string,
	region string,
	nodeName string,
) error {
	session, err := s.findProviderLoginSessionByID(ctx, sessionID)
	if err != nil {
		return err
	}

	update := s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil))
	if strings.TrimSpace(workerSessionID) != "" {
		update = update.Set("worker_session_id = ?", workerSessionID)
	}
	if strings.TrimSpace(browserInstanceID) != "" {
		update = update.Set("browser_instance_id = ?", browserInstanceID)
	}
	if strings.TrimSpace(sessionStatus) != "" {
		update = update.Set("session_status = ?", sessionStatus)
	}
	if strings.TrimSpace(status) != "" {
		update = update.Set("status = ?", status)
	}
	if strings.TrimSpace(streamSessionToken) != "" {
		update = update.Set("stream_session_token = ?", streamSessionToken)
	}
	if strings.TrimSpace(streamURL) != "" {
		update = update.Set("stream_url = ?", streamURL)
	}
	if _, err := update.Where("id = ?", sessionID).Exec(ctx); err != nil {
		return err
	}

	if strings.TrimSpace(browserInstanceID) == "" {
		return nil
	}
	browserID, err := uuid.Parse(browserInstanceID)
	if err != nil {
		return err
	}
	account, err := s.findProviderAccountByID(ctx, session.ProviderAccountID)
	if err != nil {
		return err
	}

	instance := &database.BrowserInstance{
		ID:                browserID,
		WorkspaceID:       session.WorkspaceID,
		ProviderAccountID: session.ProviderAccountID,
		Provider:          account.Provider,
		Status:            browserInstanceStatusLaunching,
		RuntimeType:       strings.TrimSpace(runtimeType),
		ProfileMountPath:  strings.TrimSpace(profileMountPath),
		StartedAt:         time.Now().UTC(),
		Region:            strings.TrimSpace(region),
		NodeName:          strings.TrimSpace(nodeName),
	}
	if strings.TrimSpace(sessionStatus) != "" {
		instance.Status = sessionStatus
	}
	if instance.RuntimeType == "" {
		instance.RuntimeType = "embedded_stream"
	}

	if _, err := s.db.NewInsert().Model(instance).Ignore().Exec(ctx); err != nil {
		return err
	}
	_, err = s.db.NewUpdate().
		Model((*database.BrowserInstance)(nil)).
		Set("status = ?", instance.Status).
		Set("runtime_type = ?", instance.RuntimeType).
		Set("profile_mount_path = ?", instance.ProfileMountPath).
		Set("region = ?", instance.Region).
		Set("node_name = ?", instance.NodeName).
		Set("last_heartbeat_at = ?", time.Now().UTC()).
		Where("id = ?", browserID).
		Exec(ctx)
	return err
}

func (s *Service) GetProviderLoginSession(ctx context.Context, principal *Principal, accountID, sessionID uuid.UUID) (*ProviderLoginSessionRecord, error) {
	account, err := s.findProviderAccountByID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspaceAccess(ctx, principal, account.WorkspaceID, "automations.view"); err != nil {
		return nil, err
	}

	var session database.ProviderLoginSession
	if err := s.db.NewSelect().
		Model(&session).
		Where("id = ?", sessionID).
		Where("provider_account_id = ?", accountID).
		Limit(1).
		Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	record := providerLoginSessionRecordFromModel(session)
	return &record, nil
}

func (s *Service) RefreshProviderLoginSessionStream(
	ctx context.Context,
	principal *Principal,
	accountID uuid.UUID,
	sessionID uuid.UUID,
	streamSessionToken string,
	streamURL string,
) (*ProviderLoginSessionRecord, error) {
	account, err := s.findProviderAccountByID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspaceAccess(ctx, principal, account.WorkspaceID, "automations.manage"); err != nil {
		return nil, err
	}
	if _, err := s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil)).
		Set("stream_session_token = ?", streamSessionToken).
		Set("stream_url = ?", streamURL).
		Where("id = ?", sessionID).
		Where("provider_account_id = ?", accountID).
		Exec(ctx); err != nil {
		return nil, err
	}
	return s.GetProviderLoginSession(ctx, principal, accountID, sessionID)
}

func (s *Service) StartLocalBridgeSession(ctx context.Context, principal *Principal, accountID, sessionID uuid.UUID) (*LocalBridgeSessionRecord, *ProviderLoginSessionRecord, error) {
	account, err := s.findProviderAccountByID(ctx, accountID)
	if err != nil {
		return nil, nil, err
	}
	if _, err := s.requireWorkspaceAccess(ctx, principal, account.WorkspaceID, "automations.manage"); err != nil {
		return nil, nil, err
	}
	session, err := s.findProviderLoginSessionByID(ctx, sessionID)
	if err != nil {
		return nil, nil, err
	}
	if session.ProviderAccountID != accountID {
		return nil, nil, ErrForbidden
	}

	model := &database.LocalBridgeSession{
		ID:                     uuid.New(),
		ProviderLoginSessionID: session.ID,
		WorkspaceID:            session.WorkspaceID,
		Status:                 "queued",
		ChallengeToken:         uuid.NewString(),
		CreatedAt:              time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(model).Exec(ctx); err != nil {
		return nil, nil, err
	}
	if _, err := s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil)).
		Set("connection_mode = ?", connectionModeLocalBridge).
		Set("session_status = ?", loginSessionStatusAuthInProgress).
		Set("fallback_required = ?", true).
		Where("id = ?", session.ID).
		Exec(ctx); err != nil {
		return nil, nil, err
	}

	bridgeRecord := localBridgeSessionRecordFromModel(*model)
	sessionRecord, err := s.GetProviderLoginSession(ctx, principal, accountID, sessionID)
	if err != nil {
		return nil, nil, err
	}
	return &bridgeRecord, sessionRecord, nil
}

func (s *Service) CreateAutomation(ctx context.Context, principal *Principal, workspaceID, providerAccountID uuid.UUID, name string, config AutomationConfig) (*AutomationRecord, error) {
	if _, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "automations.manage"); err != nil {
		return nil, err
	}

	account, err := s.findProviderAccountByID(ctx, providerAccountID)
	if err != nil {
		return nil, err
	}
	if account.WorkspaceID != workspaceID {
		return nil, ErrForbidden
	}

	name = strings.TrimSpace(name)
	if name == "" {
		return nil, fmt.Errorf("%w: automation name is required", ErrValidation)
	}
	config = normalizeAutomationConfig(config, account.Provider)
	if strings.TrimSpace(config.PromptTemplate) == "" {
		return nil, fmt.Errorf("%w: prompt template is required", ErrValidation)
	}

	configJSON, err := json.Marshal(config)
	if err != nil {
		return nil, err
	}

	model := &database.Automation{
		ID:                uuid.New(),
		WorkspaceID:       workspaceID,
		Kind:              automationKindImageGeneration,
		ProviderAccountID: providerAccountID,
		Name:              name,
		Status:            "active",
		ConfigJSON:        string(configJSON),
		CreatedAt:         time.Now().UTC(),
		UpdatedAt:         time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(model).Exec(ctx); err != nil {
		return nil, err
	}

	record, err := s.automationRecordFromModel(ctx, *model)
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (s *Service) ListAutomations(ctx context.Context, principal *Principal, workspaceID uuid.UUID) ([]AutomationRecord, error) {
	if _, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "automations.view"); err != nil {
		return nil, err
	}

	var automations []database.Automation
	if err := s.db.NewSelect().
		Model(&automations).
		Where("workspace_id = ?", workspaceID).
		OrderExpr("created_at ASC").
		Scan(ctx); err != nil {
		return nil, err
	}

	items := make([]AutomationRecord, 0, len(automations))
	for _, model := range automations {
		record, err := s.automationRecordFromModel(ctx, model)
		if err != nil {
			return nil, err
		}
		items = append(items, record)
	}
	return items, nil
}

func (s *Service) ListAutomationRuns(ctx context.Context, principal *Principal, workspaceID uuid.UUID) ([]AutomationRunRecord, error) {
	if _, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "automations.view"); err != nil {
		return nil, err
	}

	var runs []database.AutomationRun
	if err := s.db.NewSelect().
		Model(&runs).
		Where("workspace_id = ?", workspaceID).
		OrderExpr("queued_at DESC").
		Limit(25).
		Scan(ctx); err != nil {
		return nil, err
	}

	items := make([]AutomationRunRecord, 0, len(runs))
	for _, run := range runs {
		items = append(items, automationRunRecordFromModel(run))
	}
	return items, nil
}

func (s *Service) CreateAutomationRun(ctx context.Context, principal *Principal, automationID uuid.UUID, promptOverride string) (*AutomationRunDispatch, error) {
	automation, err := s.findAutomationByID(ctx, automationID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspaceAccess(ctx, principal, automation.WorkspaceID, "automations.manage"); err != nil {
		return nil, err
	}

	account, err := s.findProviderAccountByID(ctx, automation.ProviderAccountID)
	if err != nil {
		return nil, err
	}
	if account.Status != accountStatusReady && account.Status != accountStatusBusy {
		return nil, fmt.Errorf("%w: provider account must be connected before running", ErrConflict)
	}

	config, err := decodeAutomationConfig(automation.ConfigJSON)
	if err != nil {
		return nil, err
	}

	promptText := strings.TrimSpace(promptOverride)
	if promptText == "" {
		promptText = strings.TrimSpace(config.PromptTemplate)
	}
	if promptText == "" {
		return nil, fmt.Errorf("%w: prompt text is required", ErrValidation)
	}

	now := time.Now().UTC()
	run := &database.AutomationRun{
		ID:           uuid.New(),
		AutomationID: automation.ID,
		WorkspaceID:  automation.WorkspaceID,
		Status:       runStatusQueued,
		PromptText:   promptText,
		QueuedAt:     now,
	}
	if _, err := s.db.NewInsert().Model(run).Exec(ctx); err != nil {
		return nil, err
	}

	account.Status = accountStatusBusy
	account.LastError = ""
	account.UpdatedAt = now
	if _, err := s.db.NewUpdate().
		Model(account).
		Column("status", "last_error", "updated_at").
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}

	record := automationRunRecordFromModel(*run)
	dispatch := &AutomationRunDispatch{
		Run:     record,
		Account: providerAccountRecordFromModel(*account),
		Config:  config,
	}
	return dispatch, nil
}

func (s *Service) SetAutomationRunWorkerID(ctx context.Context, runID uuid.UUID, workerRunID string) error {
	_, err := s.db.NewUpdate().
		Model((*database.AutomationRun)(nil)).
		Set("worker_run_id = ?", workerRunID).
		Where("id = ?", runID).
		Exec(ctx)
	return err
}

func (s *Service) GetAutomationRun(ctx context.Context, principal *Principal, runID uuid.UUID) (*AutomationRunRecord, error) {
	run, err := s.findAutomationRunByID(ctx, runID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspaceAccess(ctx, principal, run.WorkspaceID, "automations.view"); err != nil {
		return nil, err
	}
	record := automationRunRecordFromModel(*run)
	return &record, nil
}

func (s *Service) ListAutomationRunOutputs(ctx context.Context, principal *Principal, runID uuid.UUID) ([]AutomationRunOutputRecord, error) {
	run, err := s.findAutomationRunByID(ctx, runID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspaceAccess(ctx, principal, run.WorkspaceID, "automations.view"); err != nil {
		return nil, err
	}

	var outputs []database.AutomationRunOutput
	if err := s.db.NewSelect().
		Model(&outputs).
		Where("run_id = ?", runID).
		OrderExpr("created_at ASC").
		Scan(ctx); err != nil {
		return nil, err
	}

	items := make([]AutomationRunOutputRecord, 0, len(outputs))
	for _, output := range outputs {
		items = append(items, automationRunOutputRecordFromModel(output))
	}
	return items, nil
}

func (s *Service) GetAutomationRunOutput(ctx context.Context, principal *Principal, outputID uuid.UUID) (*AutomationRunOutputRecord, error) {
	output, err := s.findAutomationRunOutputByID(ctx, outputID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspaceAccess(ctx, principal, output.WorkspaceID, "automations.view"); err != nil {
		return nil, err
	}
	record := automationRunOutputRecordFromModel(*output)
	return &record, nil
}

func (s *Service) HandleWorkerEvent(ctx context.Context, payload WorkerEventPayload) error {
	payload.EventID = strings.TrimSpace(payload.EventID)
	payload.EventType = strings.TrimSpace(payload.EventType)
	if payload.EventID == "" || payload.EventType == "" {
		return fmt.Errorf("%w: event id and event type are required", ErrValidation)
	}

	result, err := s.db.NewInsert().
		Model(&database.WorkerEvent{
			EventID:   payload.EventID,
			EventType: payload.EventType,
			CreatedAt: time.Now().UTC(),
		}).
		Ignore().
		Exec(ctx)
	if err != nil {
		return err
	}
	if rowsAffected, err := result.RowsAffected(); err == nil && rowsAffected == 0 {
		return nil
	}

	switch payload.EventType {
	case "account.ready":
		return s.handleAccountReadyEvent(ctx, payload)
	case "account.needs_reauth":
		return s.handleAccountNeedsReauthEvent(ctx, payload)
	case "browser.ready_for_user":
		return s.handleBrowserReadyForUserEvent(ctx, payload)
	case "browser.auth_detected":
		return s.handleBrowserAuthDetectedEvent(ctx, payload)
	case "browser.fallback_required":
		return s.handleBrowserFallbackRequiredEvent(ctx, payload)
	case "browser.failed":
		return s.handleBrowserFailedEvent(ctx, payload)
	case "browser.closed":
		return s.handleBrowserClosedEvent(ctx, payload)
	case "run.started", "run.progress":
		return s.handleRunProgressEvent(ctx, payload)
	case "run.thread_detected":
		return s.handleRunThreadEvent(ctx, payload)
	case "run.output_ready":
		return s.handleRunOutputReadyEvent(ctx, payload)
	case "run.completed":
		return s.handleRunCompletedEvent(ctx, payload)
	case "run.failed":
		return s.handleRunFailedEvent(ctx, payload)
	default:
		return nil
	}
}

func (s *Service) handleAccountReadyEvent(ctx context.Context, payload WorkerEventPayload) error {
	accountID, err := uuid.Parse(payload.ProviderAccountID)
	if err != nil {
		return err
	}

	now := time.Now().UTC()
	_, err = s.db.NewUpdate().
		Model((*database.ProviderAccount)(nil)).
		Set("status = ?", accountStatusReady).
		Set("last_validated_at = ?", now).
		Set("last_error = ?", "").
		Set("updated_at = ?", now).
		Where("id = ?", accountID).
		Exec(ctx)
	if err != nil {
		return err
	}
	if payload.LoginSessionID == "" {
		return nil
	}

	sessionID, err := uuid.Parse(payload.LoginSessionID)
	if err != nil {
		return err
	}
	_, err = s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil)).
		Set("status = ?", accountStatusReady).
		Set("session_status = ?", loginSessionStatusReady).
		Set("fallback_required = ?", false).
		Set("completed_at = ?", now).
		Set("last_error = ?", "").
		Where("id = ?", sessionID).
		Exec(ctx)
	return err
}

func (s *Service) handleAccountNeedsReauthEvent(ctx context.Context, payload WorkerEventPayload) error {
	accountID, err := uuid.Parse(payload.ProviderAccountID)
	if err != nil {
		return err
	}

	now := time.Now().UTC()
	_, err = s.db.NewUpdate().
		Model((*database.ProviderAccount)(nil)).
		Set("status = ?", accountStatusNeedsReauth).
		Set("last_error = ?", payload.Message).
		Set("updated_at = ?", now).
		Where("id = ?", accountID).
		Exec(ctx)
	if err != nil {
		return err
	}
	if payload.LoginSessionID == "" {
		return nil
	}
	sessionID, err := uuid.Parse(payload.LoginSessionID)
	if err != nil {
		return err
	}
	_, err = s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil)).
		Set("status = ?", accountStatusNeedsReauth).
		Set("session_status = ?", loginSessionStatusFailed).
		Set("completed_at = ?", now).
		Set("last_error = ?", payload.Message).
		Where("id = ?", sessionID).
		Exec(ctx)
	return err
}

func (s *Service) handleBrowserReadyForUserEvent(ctx context.Context, payload WorkerEventPayload) error {
	sessionID, err := uuid.Parse(payload.LoginSessionID)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	if _, err := s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil)).
		Set("session_status = ?", loginSessionStatusReadyForUser).
		Set("browser_instance_id = COALESCE(NULLIF(?, ''), browser_instance_id)", payload.BrowserInstanceID).
		Set("stream_session_token = COALESCE(NULLIF(?, ''), stream_session_token)", payload.StreamSessionToken).
		Set("stream_url = COALESCE(NULLIF(?, ''), stream_url)", payload.StreamURL).
		Set("last_error = ?", "").
		Set("fallback_required = ?", false).
		Where("id = ?", sessionID).
		Exec(ctx); err != nil {
		return err
	}
	if strings.TrimSpace(payload.BrowserInstanceID) == "" {
		return nil
	}
	return s.touchBrowserInstance(ctx, payload, browserInstanceStatusReadyForUser, now)
}

func (s *Service) handleBrowserAuthDetectedEvent(ctx context.Context, payload WorkerEventPayload) error {
	sessionID, err := uuid.Parse(payload.LoginSessionID)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	if _, err := s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil)).
		Set("session_status = ?", loginSessionStatusAuthInProgress).
		Set("last_error = ?", "").
		Where("id = ?", sessionID).
		Exec(ctx); err != nil {
		return err
	}
	if strings.TrimSpace(payload.BrowserInstanceID) == "" {
		return nil
	}
	return s.touchBrowserInstance(ctx, payload, browserInstanceStatusAuthInProgress, now)
}

func (s *Service) handleBrowserFallbackRequiredEvent(ctx context.Context, payload WorkerEventPayload) error {
	sessionID, err := uuid.Parse(payload.LoginSessionID)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	if _, err := s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil)).
		Set("session_status = ?", loginSessionStatusAuthInProgress).
		Set("fallback_required = ?", true).
		Set("last_error = ?", payload.Message).
		Where("id = ?", sessionID).
		Exec(ctx); err != nil {
		return err
	}
	if strings.TrimSpace(payload.BrowserInstanceID) == "" {
		return nil
	}
	return s.touchBrowserInstance(ctx, payload, browserInstanceStatusAuthInProgress, now)
}

func (s *Service) handleBrowserFailedEvent(ctx context.Context, payload WorkerEventPayload) error {
	sessionID, err := uuid.Parse(payload.LoginSessionID)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	if _, err := s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil)).
		Set("session_status = ?", loginSessionStatusFailed).
		Set("status = ?", accountStatusNeedsReauth).
		Set("last_error = ?", payload.Message).
		Set("completed_at = ?", now).
		Where("id = ?", sessionID).
		Exec(ctx); err != nil {
		return err
	}
	if strings.TrimSpace(payload.ProviderAccountID) != "" {
		accountID, err := uuid.Parse(payload.ProviderAccountID)
		if err == nil {
			_, _ = s.db.NewUpdate().
				Model((*database.ProviderAccount)(nil)).
				Set("status = ?", accountStatusNeedsReauth).
				Set("last_error = ?", payload.Message).
				Set("updated_at = ?", now).
				Where("id = ?", accountID).
				Exec(ctx)
		}
	}
	if strings.TrimSpace(payload.BrowserInstanceID) == "" {
		return nil
	}
	return s.closeBrowserInstance(ctx, payload, browserInstanceStatusFailed, now)
}

func (s *Service) handleBrowserClosedEvent(ctx context.Context, payload WorkerEventPayload) error {
	now := time.Now().UTC()
	if strings.TrimSpace(payload.BrowserInstanceID) != "" {
		if err := s.closeBrowserInstance(ctx, payload, browserInstanceStatusClosed, now); err != nil {
			return err
		}
	}
	if strings.TrimSpace(payload.LoginSessionID) == "" {
		return nil
	}
	sessionID, err := uuid.Parse(payload.LoginSessionID)
	if err != nil {
		return err
	}
	session, err := s.findProviderLoginSessionByID(ctx, sessionID)
	if err != nil {
		return err
	}
	if session.CompletedAt != nil || session.SessionStatus == loginSessionStatusReady || session.SessionStatus == loginSessionStatusFailed {
		return nil
	}
	_, err = s.db.NewUpdate().
		Model((*database.ProviderLoginSession)(nil)).
		Set("session_status = ?", loginSessionStatusExpired).
		Set("completed_at = ?", now).
		Where("id = ?", sessionID).
		Exec(ctx)
	return err
}

func (s *Service) handleRunProgressEvent(ctx context.Context, payload WorkerEventPayload) error {
	runID, err := uuid.Parse(payload.RunID)
	if err != nil {
		return err
	}

	if job, err := s.findImageJobByID(ctx, runID); err == nil {
		query := s.db.NewUpdate().
			Model((*database.ImageJob)(nil))
		if strings.TrimSpace(payload.Status) != "" {
			query = query.Set("status = ?", payload.Status)
		}
		if strings.TrimSpace(payload.WorkerRunID) != "" {
			query = query.Set("worker_run_id = ?", payload.WorkerRunID)
		}
		if payload.EventType == "run.started" {
			query = query.Set("started_at = COALESCE(started_at, ?)", time.Now().UTC())
		}
		if strings.TrimSpace(payload.Message) != "" {
			query = query.Set("last_error = ?", payload.Message)
		} else {
			query = query.Set("last_error = ?", "")
		}
		query = query.Set("updated_at = ?", time.Now().UTC())
		_, err = query.Where("id = ?", runID).Exec(ctx)
		if err != nil {
			return err
		}
		_, _ = s.db.NewUpdate().
			Model((*database.ProviderAccount)(nil)).
			Set("status = ?", accountStatusBusy).
			Set("updated_at = ?", time.Now().UTC()).
			Where("id = ?", job.ProviderAccountID).
			Exec(ctx)
		return nil
	} else if !errors.Is(err, ErrNotFound) {
		return err
	}

	query := s.db.NewUpdate().Model((*database.AutomationRun)(nil))

	if strings.TrimSpace(payload.Status) != "" {
		query = query.Set("status = ?", payload.Status)
	}
	if strings.TrimSpace(payload.WorkerRunID) != "" {
		query = query.Set("worker_run_id = ?", payload.WorkerRunID)
	}
	if payload.EventType == "run.started" {
		query = query.Set("started_at = COALESCE(started_at, ?)", time.Now().UTC())
	}
	if strings.TrimSpace(payload.Message) != "" {
		query = query.Set("last_error = ?", payload.Message)
	} else {
		query = query.Set("last_error = ?", "")
	}
	_, err = query.Where("id = ?", runID).Exec(ctx)
	return err
}

func (s *Service) handleRunThreadEvent(ctx context.Context, payload WorkerEventPayload) error {
	runID, err := uuid.Parse(payload.RunID)
	if err != nil {
		return err
	}
	if _, err := s.findImageJobByID(ctx, runID); err == nil {
		_, err = s.db.NewUpdate().
			Model((*database.ImageJob)(nil)).
			Set("provider_thread_url = ?", payload.ProviderThreadURL).
			Set("provider_thread_id = ?", payload.ProviderThreadID).
			Set("updated_at = ?", time.Now().UTC()).
			Where("id = ?", runID).
			Exec(ctx)
		return err
	} else if !errors.Is(err, ErrNotFound) {
		return err
	}
	_, err = s.db.NewUpdate().
		Model((*database.AutomationRun)(nil)).
		Set("provider_thread_url = ?", payload.ProviderThreadURL).
		Set("provider_thread_id = ?", payload.ProviderThreadID).
		Where("id = ?", runID).
		Exec(ctx)
	return err
}

func (s *Service) handleRunOutputReadyEvent(ctx context.Context, payload WorkerEventPayload) error {
	if payload.Output == nil {
		return fmt.Errorf("%w: output payload is required", ErrValidation)
	}
	runID, err := uuid.Parse(payload.RunID)
	if err != nil {
		return err
	}
	if job, err := s.findImageJobByID(ctx, runID); err == nil {
		outputID := payload.Output.ID
		if strings.TrimSpace(outputID) == "" {
			outputID = uuid.NewString()
		}
		parsedOutputID, err := uuid.Parse(outputID)
		if err != nil {
			return err
		}
		output := &database.ImageOutput{
			ID:               parsedOutputID,
			ImageJobID:       job.ID,
			WorkspaceID:      job.WorkspaceID,
			StoragePath:      payload.Output.StoragePath,
			MimeType:         payload.Output.MimeType,
			ByteSize:         payload.Output.ByteSize,
			Width:            payload.Output.Width,
			Height:           payload.Output.Height,
			SHA256:           payload.Output.SHA256,
			ProviderAssetURL: payload.Output.ProviderAssetURL,
			CreatedAt:        time.Now().UTC(),
		}
		_, err = s.db.NewInsert().Model(output).Ignore().Exec(ctx)
		return err
	} else if !errors.Is(err, ErrNotFound) {
		return err
	}
	run, err := s.findAutomationRunByID(ctx, runID)
	if err != nil {
		return err
	}
	outputID := payload.Output.ID
	if strings.TrimSpace(outputID) == "" {
		outputID = uuid.NewString()
	}
	parsedOutputID, err := uuid.Parse(outputID)
	if err != nil {
		return err
	}

	output := &database.AutomationRunOutput{
		ID:               parsedOutputID,
		RunID:            run.ID,
		WorkspaceID:      run.WorkspaceID,
		StoragePath:      payload.Output.StoragePath,
		MimeType:         payload.Output.MimeType,
		ByteSize:         payload.Output.ByteSize,
		Width:            payload.Output.Width,
		Height:           payload.Output.Height,
		SHA256:           payload.Output.SHA256,
		ProviderAssetURL: payload.Output.ProviderAssetURL,
		CreatedAt:        time.Now().UTC(),
	}
	_, err = s.db.NewInsert().Model(output).Ignore().Exec(ctx)
	return err
}

func (s *Service) handleRunCompletedEvent(ctx context.Context, payload WorkerEventPayload) error {
	runID, err := uuid.Parse(payload.RunID)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	if job, err := s.findImageJobByID(ctx, runID); err == nil {
		if _, err := s.db.NewUpdate().
			Model((*database.ImageJob)(nil)).
			Set("status = ?", runStatusCompleted).
			Set("completed_at = ?", now).
			Set("last_error = ?", "").
			Set("updated_at = ?", now).
			Where("id = ?", runID).
			Exec(ctx); err != nil {
			return err
		}
		_, err = s.db.NewUpdate().
			Model((*database.ProviderAccount)(nil)).
			Set("status = ?", accountStatusReady).
			Set("updated_at = ?", now).
			Where("id = ?", job.ProviderAccountID).
			Exec(ctx)
		return err
	} else if !errors.Is(err, ErrNotFound) {
		return err
	}
	run, err := s.findAutomationRunByID(ctx, runID)
	if err != nil {
		return err
	}
	automation, err := s.findAutomationByID(ctx, run.AutomationID)
	if err != nil {
		return err
	}

	if _, err := s.db.NewUpdate().
		Model((*database.AutomationRun)(nil)).
		Set("status = ?", runStatusCompleted).
		Set("completed_at = ?", now).
		Set("last_error = ?", "").
		Where("id = ?", runID).
		Exec(ctx); err != nil {
		return err
	}
	_, err = s.db.NewUpdate().
		Model((*database.ProviderAccount)(nil)).
		Set("status = ?", accountStatusReady).
		Set("updated_at = ?", now).
		Where("id = ?", automation.ProviderAccountID).
		Exec(ctx)
	return err
}

func (s *Service) handleRunFailedEvent(ctx context.Context, payload WorkerEventPayload) error {
	runID, err := uuid.Parse(payload.RunID)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	if job, err := s.findImageJobByID(ctx, runID); err == nil {
		if _, err := s.db.NewUpdate().
			Model((*database.ImageJob)(nil)).
			Set("status = ?", runStatusFailed).
			Set("completed_at = ?", now).
			Set("last_error = ?", payload.Message).
			Set("updated_at = ?", now).
			Where("id = ?", runID).
			Exec(ctx); err != nil {
			return err
		}
		accountStatus := accountStatusReady
		if payload.Status == accountStatusNeedsReauth {
			accountStatus = accountStatusNeedsReauth
		}
		_, err = s.db.NewUpdate().
			Model((*database.ProviderAccount)(nil)).
			Set("status = ?", accountStatus).
			Set("last_error = ?", payload.Message).
			Set("updated_at = ?", now).
			Where("id = ?", job.ProviderAccountID).
			Exec(ctx)
		return err
	} else if !errors.Is(err, ErrNotFound) {
		return err
	}
	run, err := s.findAutomationRunByID(ctx, runID)
	if err != nil {
		return err
	}
	automation, err := s.findAutomationByID(ctx, run.AutomationID)
	if err != nil {
		return err
	}

	if _, err := s.db.NewUpdate().
		Model((*database.AutomationRun)(nil)).
		Set("status = ?", runStatusFailed).
		Set("completed_at = ?", now).
		Set("last_error = ?", payload.Message).
		Where("id = ?", runID).
		Exec(ctx); err != nil {
		return err
	}
	accountStatus := accountStatusReady
	if payload.Status == accountStatusNeedsReauth {
		accountStatus = accountStatusNeedsReauth
	}
	_, err = s.db.NewUpdate().
		Model((*database.ProviderAccount)(nil)).
		Set("status = ?", accountStatus).
		Set("last_error = ?", payload.Message).
		Set("updated_at = ?", now).
		Where("id = ?", automation.ProviderAccountID).
		Exec(ctx)
	return err
}

func (s *Service) findProviderAccountByID(ctx context.Context, accountID uuid.UUID) (*database.ProviderAccount, error) {
	var account database.ProviderAccount
	if err := s.db.NewSelect().Model(&account).Where("id = ?", accountID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &account, nil
}

func (s *Service) findActiveProviderLoginSession(ctx context.Context, accountID uuid.UUID) (*database.ProviderLoginSession, error) {
	var session database.ProviderLoginSession
	if err := s.db.NewSelect().
		Model(&session).
		Where("provider_account_id = ?", accountID).
		Where("completed_at IS NULL").
		Where("expires_at > ?", time.Now().UTC()).
		Where("session_status NOT IN (?, ?)", loginSessionStatusFailed, loginSessionStatusExpired).
		OrderExpr("started_at DESC").
		Limit(1).
		Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &session, nil
}

func (s *Service) findProviderLoginSessionByID(ctx context.Context, sessionID uuid.UUID) (*database.ProviderLoginSession, error) {
	var session database.ProviderLoginSession
	if err := s.db.NewSelect().Model(&session).Where("id = ?", sessionID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &session, nil
}

func (s *Service) findAutomationByID(ctx context.Context, automationID uuid.UUID) (*database.Automation, error) {
	var automation database.Automation
	if err := s.db.NewSelect().Model(&automation).Where("id = ?", automationID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &automation, nil
}

func (s *Service) findAutomationRunByID(ctx context.Context, runID uuid.UUID) (*database.AutomationRun, error) {
	var run database.AutomationRun
	if err := s.db.NewSelect().Model(&run).Where("id = ?", runID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &run, nil
}

func (s *Service) findAutomationRunOutputByID(ctx context.Context, outputID uuid.UUID) (*database.AutomationRunOutput, error) {
	var output database.AutomationRunOutput
	if err := s.db.NewSelect().Model(&output).Where("id = ?", outputID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &output, nil
}

func (s *Service) automationRecordFromModel(ctx context.Context, model database.Automation) (AutomationRecord, error) {
	config, err := decodeAutomationConfig(model.ConfigJSON)
	if err != nil {
		return AutomationRecord{}, err
	}

	var latestRun database.AutomationRun
	err = s.db.NewSelect().
		Model(&latestRun).
		Where("automation_id = ?", model.ID).
		OrderExpr("queued_at DESC").
		Limit(1).
		Scan(ctx)
	var lastRun *AutomationRunRecord
	if err == nil {
		record := automationRunRecordFromModel(latestRun)
		lastRun = &record
	} else if !errors.Is(err, sql.ErrNoRows) {
		return AutomationRecord{}, err
	}

	return AutomationRecord{
		ID:                model.ID.String(),
		WorkspaceID:       model.WorkspaceID.String(),
		Kind:              model.Kind,
		ProviderAccountID: model.ProviderAccountID.String(),
		Name:              model.Name,
		Status:            model.Status,
		Config:            config,
		CreatedAt:         model.CreatedAt.Format(time.RFC3339),
		UpdatedAt:         model.UpdatedAt.Format(time.RFC3339),
		LastRun:           lastRun,
	}, nil
}

func providerAccountRecordFromModel(model database.ProviderAccount) ProviderAccountRecord {
	record := ProviderAccountRecord{
		ID:               model.ID.String(),
		WorkspaceID:      model.WorkspaceID.String(),
		Provider:         model.Provider,
		Label:            model.Label,
		Status:           model.Status,
		ProfileKey:       model.ProfileKey,
		CooldownSeconds:  model.CooldownSeconds,
		JitterMinSeconds: model.JitterMinSeconds,
		JitterMaxSeconds: model.JitterMaxSeconds,
		IsDefaultForAPI:  model.IsDefaultForAPI,
		LastError:        model.LastError,
		CreatedAt:        model.CreatedAt.Format(time.RFC3339),
		UpdatedAt:        model.UpdatedAt.Format(time.RFC3339),
	}
	if model.LastValidatedAt != nil {
		record.LastValidatedAt = model.LastValidatedAt.Format(time.RFC3339)
	}
	return record
}

func providerLoginSessionRecordFromModel(model database.ProviderLoginSession) ProviderLoginSessionRecord {
	record := ProviderLoginSessionRecord{
		ID:                 model.ID.String(),
		ProviderAccountID:  model.ProviderAccountID.String(),
		WorkspaceID:        model.WorkspaceID.String(),
		ConnectionMode:     model.ConnectionMode,
		SessionStatus:      model.SessionStatus,
		Status:             model.Status,
		BrowserInstanceID:  model.BrowserInstanceID,
		StreamSessionToken: model.StreamSessionToken,
		StreamURL:          model.StreamURL,
		FallbackRequired:   model.FallbackRequired,
		WorkerSessionID:    model.WorkerSessionID,
		StartedAt:          model.StartedAt.Format(time.RFC3339),
		ExpiresAt:          model.ExpiresAt.Format(time.RFC3339),
		LastError:          model.LastError,
	}
	if model.CompletedAt != nil {
		record.CompletedAt = model.CompletedAt.Format(time.RFC3339)
	}
	return record
}

func automationRunRecordFromModel(model database.AutomationRun) AutomationRunRecord {
	record := AutomationRunRecord{
		ID:                model.ID.String(),
		AutomationID:      model.AutomationID.String(),
		WorkspaceID:       model.WorkspaceID.String(),
		Status:            model.Status,
		PromptText:        model.PromptText,
		WorkerRunID:       model.WorkerRunID,
		ProviderThreadURL: model.ProviderThreadURL,
		ProviderThreadID:  model.ProviderThreadID,
		QueuedAt:          model.QueuedAt.Format(time.RFC3339),
		LastError:         model.LastError,
	}
	if model.StartedAt != nil {
		record.StartedAt = model.StartedAt.Format(time.RFC3339)
	}
	if model.CompletedAt != nil {
		record.CompletedAt = model.CompletedAt.Format(time.RFC3339)
	}
	return record
}

func automationRunOutputRecordFromModel(model database.AutomationRunOutput) AutomationRunOutputRecord {
	return AutomationRunOutputRecord{
		ID:               model.ID.String(),
		RunID:            model.RunID.String(),
		WorkspaceID:      model.WorkspaceID.String(),
		StoragePath:      model.StoragePath,
		MimeType:         model.MimeType,
		ByteSize:         model.ByteSize,
		Width:            model.Width,
		Height:           model.Height,
		SHA256:           model.SHA256,
		ProviderAssetURL: model.ProviderAssetURL,
		CreatedAt:        model.CreatedAt.Format(time.RFC3339),
		ContentURL:       fmt.Sprintf("/api/v1/automation-run-outputs/%s/content", model.ID),
	}
}

func browserInstanceRecordFromModel(model database.BrowserInstance) BrowserInstanceRecord {
	record := BrowserInstanceRecord{
		ID:                model.ID.String(),
		WorkspaceID:       model.WorkspaceID.String(),
		ProviderAccountID: model.ProviderAccountID.String(),
		Provider:          model.Provider,
		Status:            model.Status,
		RuntimeType:       model.RuntimeType,
		ProfileMountPath:  model.ProfileMountPath,
		StartedAt:         model.StartedAt.Format(time.RFC3339),
		Region:            model.Region,
		NodeName:          model.NodeName,
		LastError:         model.LastError,
	}
	if model.EndedAt != nil {
		record.EndedAt = model.EndedAt.Format(time.RFC3339)
	}
	if model.LastHeartbeatAt != nil {
		record.LastHeartbeatAt = model.LastHeartbeatAt.Format(time.RFC3339)
	}
	return record
}

func localBridgeSessionRecordFromModel(model database.LocalBridgeSession) LocalBridgeSessionRecord {
	record := LocalBridgeSessionRecord{
		ID:                     model.ID.String(),
		ProviderLoginSessionID: model.ProviderLoginSessionID.String(),
		WorkspaceID:            model.WorkspaceID.String(),
		Status:                 model.Status,
		ChallengeToken:         model.ChallengeToken,
		LastError:              model.LastError,
		CreatedAt:              model.CreatedAt.Format(time.RFC3339),
	}
	if model.ConnectedAt != nil {
		record.ConnectedAt = model.ConnectedAt.Format(time.RFC3339)
	}
	if model.CompletedAt != nil {
		record.CompletedAt = model.CompletedAt.Format(time.RFC3339)
	}
	return record
}

func (s *Service) touchBrowserInstance(ctx context.Context, payload WorkerEventPayload, status string, at time.Time) error {
	browserID, err := uuid.Parse(payload.BrowserInstanceID)
	if err != nil {
		return err
	}
	query := s.db.NewUpdate().
		Model((*database.BrowserInstance)(nil)).
		Set("status = ?", status).
		Set("last_heartbeat_at = ?", at)
	if strings.TrimSpace(payload.StreamURL) != "" {
		query = query.Set("last_error = ?", "")
	}
	if strings.TrimSpace(payload.RuntimeType) != "" {
		query = query.Set("runtime_type = ?", payload.RuntimeType)
	}
	if strings.TrimSpace(payload.ProfileMountPath) != "" {
		query = query.Set("profile_mount_path = ?", payload.ProfileMountPath)
	}
	if strings.TrimSpace(payload.Region) != "" {
		query = query.Set("region = ?", payload.Region)
	}
	if strings.TrimSpace(payload.NodeName) != "" {
		query = query.Set("node_name = ?", payload.NodeName)
	}
	if strings.TrimSpace(payload.Message) != "" {
		query = query.Set("last_error = ?", payload.Message)
	}
	_, err = query.Where("id = ?", browserID).Exec(ctx)
	return err
}

func (s *Service) closeBrowserInstance(ctx context.Context, payload WorkerEventPayload, status string, at time.Time) error {
	browserID, err := uuid.Parse(payload.BrowserInstanceID)
	if err != nil {
		return err
	}
	query := s.db.NewUpdate().
		Model((*database.BrowserInstance)(nil)).
		Set("status = ?", status).
		Set("ended_at = ?", at).
		Set("last_heartbeat_at = ?", at)
	if strings.TrimSpace(payload.Message) != "" {
		query = query.Set("last_error = ?", payload.Message)
	}
	_, err = query.Where("id = ?", browserID).Exec(ctx)
	return err
}

func normalizeAutomationConfig(config AutomationConfig, provider string) AutomationConfig {
	config.PromptTemplate = strings.TrimSpace(config.PromptTemplate)
	config.AspectRatio = strings.TrimSpace(config.AspectRatio)
	config.Provider = strings.TrimSpace(config.Provider)
	if config.ImageCount < 1 {
		config.ImageCount = 1
	}
	if config.Provider == "" {
		config.Provider = provider
	}
	return config
}

func decodeAutomationConfig(raw string) (AutomationConfig, error) {
	var config AutomationConfig
	if err := json.Unmarshal([]byte(raw), &config); err != nil {
		return AutomationConfig{}, err
	}
	return normalizeAutomationConfig(config, config.Provider), nil
}

func (s *Service) ensureProviderProfileKey(ctx context.Context, workspaceID uuid.UUID, provider, label string) string {
	base := slugify(strings.TrimSpace(provider + "-" + label))
	if base == "" {
		base = provider
	}

	candidate := base
	for index := 1; index < 1000; index++ {
		count, err := s.db.NewSelect().
			Model((*database.ProviderAccount)(nil)).
			Where("workspace_id = ?", workspaceID).
			Where("profile_key = ?", candidate).
			Count(ctx)
		if err == nil && count == 0 {
			return candidate
		}
		candidate = fmt.Sprintf("%s-%d", base, index+1)
	}
	return fmt.Sprintf("%s-%s", base, uuid.NewString())
}

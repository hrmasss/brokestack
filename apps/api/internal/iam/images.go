package iam

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/brokestack/api/internal/database"
)

const (
	imageSourceWeb = "web"
	imageSourceAPI = "api"

	imageRequestTypeSingle = "single"
	imageRequestTypeBatch  = "batch"

	apiKeyStatusActive  = "active"
	apiKeyStatusRevoked = "revoked"
)

type ImageBatchRecord struct {
	ID                string `json:"id"`
	WorkspaceID       string `json:"workspaceId"`
	ProviderAccountID string `json:"providerAccountId"`
	Title             string `json:"title"`
	PromptTemplate    string `json:"promptTemplate"`
	PlaceholderName   string `json:"placeholderName"`
	Source            string `json:"source"`
	Status            string `json:"status"`
	CreatedAt         string `json:"createdAt"`
	UpdatedAt         string `json:"updatedAt"`
}

type ImageJobRecord struct {
	ID                string `json:"id"`
	WorkspaceID       string `json:"workspaceId"`
	ProviderAccountID string `json:"providerAccountId"`
	Provider          string `json:"provider"`
	ProviderLabel     string `json:"providerLabel"`
	BatchID           string `json:"batchId,omitempty"`
	APIKeyID          string `json:"apiKeyId,omitempty"`
	Source            string `json:"source"`
	RequestType       string `json:"requestType"`
	Title             string `json:"title"`
	PromptText        string `json:"promptText"`
	AspectRatio       string `json:"aspectRatio,omitempty"`
	Status            string `json:"status"`
	WorkerRunID       string `json:"workerRunId,omitempty"`
	ProviderThreadURL string `json:"providerThreadUrl,omitempty"`
	ProviderThreadID  string `json:"providerThreadId,omitempty"`
	QueuedAt          string `json:"queuedAt"`
	StartedAt         string `json:"startedAt,omitempty"`
	CompletedAt       string `json:"completedAt,omitempty"`
	LastError         string `json:"lastError,omitempty"`
	OutputCount       int    `json:"outputCount"`
}

type ImageOutputRecord struct {
	ID               string `json:"id"`
	ImageJobID       string `json:"imageJobId"`
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

type ImageBatchResult struct {
	Batch ImageBatchRecord `json:"batch"`
	Jobs  []ImageJobRecord `json:"jobs"`
}

type WorkspaceAPIKeyRecord struct {
	ID                string   `json:"id"`
	WorkspaceID       string   `json:"workspaceId"`
	Name              string   `json:"name"`
	KeyPrefix         string   `json:"keyPrefix"`
	Status            string   `json:"status"`
	Scopes            []string `json:"scopes"`
	RequestsPerMinute int      `json:"requestsPerMinute"`
	DailyImageQuota   int      `json:"dailyImageQuota"`
	LastUsedAt        string   `json:"lastUsedAt,omitempty"`
	LastUsedIP        string   `json:"lastUsedIp,omitempty"`
	CreatedAt         string   `json:"createdAt"`
	UpdatedAt         string   `json:"updatedAt"`
}

type CreatedWorkspaceAPIKeyRecord struct {
	APIKey WorkspaceAPIKeyRecord `json:"apiKey"`
	Secret string                `json:"secret"`
}

type ImageJobDispatch struct {
	Job     ImageJobRecord
	Account ProviderAccountRecord
}

type createImageJobInput struct {
	WorkspaceID       uuid.UUID
	ProviderAccountID uuid.UUID
	BatchID           *uuid.UUID
	APIKeyID          *uuid.UUID
	Source            string
	RequestType       string
	Title             string
	PromptText        string
	AspectRatio       string
}

func hasPermission(permissions []APIPermission, code string) bool {
	for _, permission := range permissions {
		if permission.Code == code {
			return true
		}
	}
	return false
}

func (s *Service) requireWorkspacePermissionFallback(ctx context.Context, principal *Principal, workspaceID uuid.UUID, primaryPermission, legacyPermission string) ([]APIPermission, error) {
	user, err := s.findUserByID(ctx, principal.UserID)
	if err != nil {
		return nil, err
	}
	if user.Status != "active" {
		return nil, ErrForbidden
	}
	permissions, err := s.listWorkspacePermissionsForUser(ctx, principal.UserID, workspaceID, principal.AssumedWorkspaceID)
	if err != nil {
		return nil, err
	}
	if hasPermission(permissions, primaryPermission) || (legacyPermission != "" && hasPermission(permissions, legacyPermission)) {
		return permissions, nil
	}
	return nil, ErrForbidden
}

func (s *Service) ListImageJobs(ctx context.Context, principal *Principal, workspaceID uuid.UUID) ([]ImageJobRecord, error) {
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, workspaceID, "images.view", "automations.view"); err != nil {
		return nil, err
	}
	return s.listImageJobsByWorkspace(ctx, workspaceID)
}

func (s *Service) listImageJobsByWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]ImageJobRecord, error) {
	var jobs []database.ImageJob
	if err := s.db.NewSelect().
		Model(&jobs).
		Where("workspace_id = ?", workspaceID).
		OrderExpr("queued_at DESC").
		Limit(250).
		Scan(ctx); err != nil {
		return nil, err
	}
	return s.imageJobRecordsFromModels(ctx, jobs)
}

func (s *Service) GetImageJob(ctx context.Context, principal *Principal, jobID uuid.UUID) (*ImageJobRecord, error) {
	job, err := s.findImageJobByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, job.WorkspaceID, "images.view", "automations.view"); err != nil {
		return nil, err
	}
	record, err := s.imageJobRecordFromModel(ctx, *job)
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (s *Service) ListImageOutputs(ctx context.Context, principal *Principal, jobID uuid.UUID) ([]ImageOutputRecord, error) {
	job, err := s.findImageJobByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, job.WorkspaceID, "images.view", "automations.view"); err != nil {
		return nil, err
	}
	return s.listImageOutputsByJobID(ctx, job.ID)
}

func (s *Service) listImageOutputsByJobID(ctx context.Context, jobID uuid.UUID) ([]ImageOutputRecord, error) {
	var outputs []database.ImageOutput
	if err := s.db.NewSelect().
		Model(&outputs).
		Where("image_job_id = ?", jobID).
		OrderExpr("created_at ASC").
		Scan(ctx); err != nil {
		return nil, err
	}
	items := make([]ImageOutputRecord, 0, len(outputs))
	for _, output := range outputs {
		items = append(items, imageOutputRecordFromModel(output))
	}
	return items, nil
}

func (s *Service) GetImageOutput(ctx context.Context, principal *Principal, outputID uuid.UUID) (*ImageOutputRecord, error) {
	output, err := s.findImageOutputByID(ctx, outputID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, output.WorkspaceID, "images.view", "automations.view"); err != nil {
		return nil, err
	}
	record := imageOutputRecordFromModel(*output)
	return &record, nil
}

func (s *Service) UpdateProviderAccountImageSettings(
	ctx context.Context,
	principal *Principal,
	accountID uuid.UUID,
	cooldownSeconds, jitterMinSeconds, jitterMaxSeconds int,
	isDefaultForAPI bool,
) (*ProviderAccountRecord, error) {
	account, err := s.findProviderAccountByID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, account.WorkspaceID, "images.manage", "automations.manage"); err != nil {
		return nil, err
	}
	if cooldownSeconds < 0 || jitterMinSeconds < 0 || jitterMaxSeconds < 0 {
		return nil, fmt.Errorf("%w: image timing values must be non-negative", ErrValidation)
	}
	if jitterMaxSeconds < jitterMinSeconds {
		return nil, fmt.Errorf("%w: jitter max must be greater than or equal to jitter min", ErrValidation)
	}
	now := time.Now().UTC()
	if isDefaultForAPI {
		if _, err := s.db.NewUpdate().
			Model((*database.ProviderAccount)(nil)).
			Set("is_default_for_api = ?", false).
			Set("updated_at = ?", now).
			Where("workspace_id = ?", account.WorkspaceID).
			Exec(ctx); err != nil {
			return nil, err
		}
	}
	account.CooldownSeconds = cooldownSeconds
	account.JitterMinSeconds = jitterMinSeconds
	account.JitterMaxSeconds = jitterMaxSeconds
	account.IsDefaultForAPI = isDefaultForAPI
	account.UpdatedAt = now
	if _, err := s.db.NewUpdate().
		Model(account).
		Column("cooldown_seconds", "jitter_min_seconds", "jitter_max_seconds", "is_default_for_api", "updated_at").
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}
	record := providerAccountRecordFromModel(*account)
	return &record, nil
}

func (s *Service) CreateImageJob(
	ctx context.Context,
	principal *Principal,
	workspaceID, providerAccountID uuid.UUID,
	title, promptText, aspectRatio string,
) (*ImageJobDispatch, error) {
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, workspaceID, "images.manage", "automations.manage"); err != nil {
		return nil, err
	}
	account, err := s.findProviderAccountByID(ctx, providerAccountID)
	if err != nil {
		return nil, err
	}
	if account.WorkspaceID != workspaceID {
		return nil, ErrForbidden
	}
	job, err := s.createImageJobModel(ctx, createImageJobInput{
		WorkspaceID:       workspaceID,
		ProviderAccountID: providerAccountID,
		Source:            imageSourceWeb,
		RequestType:       imageRequestTypeSingle,
		Title:             title,
		PromptText:        promptText,
		AspectRatio:       aspectRatio,
	})
	if err != nil {
		return nil, err
	}
	record, err := s.imageJobRecordFromModel(ctx, *job)
	if err != nil {
		return nil, err
	}
	return &ImageJobDispatch{
		Job:     record,
		Account: providerAccountRecordFromModel(*account),
	}, nil
}

func (s *Service) CreateImageBatch(
	ctx context.Context,
	principal *Principal,
	workspaceID, providerAccountID uuid.UUID,
	title, promptTemplate, placeholderName, aspectRatio string,
	values []string,
) (*ImageBatchResult, []ImageJobDispatch, error) {
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, workspaceID, "images.manage", "automations.manage"); err != nil {
		return nil, nil, err
	}
	account, err := s.findProviderAccountByID(ctx, providerAccountID)
	if err != nil {
		return nil, nil, err
	}
	if account.WorkspaceID != workspaceID {
		return nil, nil, ErrForbidden
	}
	trimmedValues := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value != "" {
			trimmedValues = append(trimmedValues, value)
		}
	}
	if len(trimmedValues) == 0 {
		return nil, nil, fmt.Errorf("%w: at least one batch value is required", ErrValidation)
	}
	promptTemplate = strings.TrimSpace(promptTemplate)
	if promptTemplate == "" {
		return nil, nil, fmt.Errorf("%w: prompt template is required", ErrValidation)
	}
	placeholderName = strings.TrimSpace(placeholderName)
	if placeholderName == "" {
		placeholderName = "item"
	}
	now := time.Now().UTC()
	batch := &database.ImageBatch{
		ID:                uuid.New(),
		WorkspaceID:       workspaceID,
		ProviderAccountID: providerAccountID,
		Title:             strings.TrimSpace(title),
		PromptTemplate:    promptTemplate,
		PlaceholderName:   placeholderName,
		Source:            imageSourceWeb,
		Status:            runStatusQueued,
		CreatedByUserID:   &principal.UserID,
		CreatedAt:         now,
		UpdatedAt:         now,
	}
	if _, err := s.db.NewInsert().Model(batch).Exec(ctx); err != nil {
		return nil, nil, err
	}
	dispatches := make([]ImageJobDispatch, 0, len(trimmedValues))
	records := make([]ImageJobRecord, 0, len(trimmedValues))
	for _, value := range trimmedValues {
		jobTitle := strings.TrimSpace(title)
		if jobTitle != "" {
			jobTitle = fmt.Sprintf("%s · %s", jobTitle, value)
		} else {
			jobTitle = value
		}
		job, err := s.createImageJobModel(ctx, createImageJobInput{
			WorkspaceID:       workspaceID,
			ProviderAccountID: providerAccountID,
			BatchID:           &batch.ID,
			Source:            imageSourceWeb,
			RequestType:       imageRequestTypeBatch,
			Title:             jobTitle,
			PromptText:        applyBatchTemplate(promptTemplate, placeholderName, value),
			AspectRatio:       aspectRatio,
		})
		if err != nil {
			return nil, nil, err
		}
		record, err := s.imageJobRecordFromModel(ctx, *job)
		if err != nil {
			return nil, nil, err
		}
		records = append(records, record)
		dispatches = append(dispatches, ImageJobDispatch{
			Job:     record,
			Account: providerAccountRecordFromModel(*account),
		})
	}
	result := &ImageBatchResult{
		Batch: imageBatchRecordFromModel(*batch),
		Jobs:  records,
	}
	return result, dispatches, nil
}

func (s *Service) createImageJobModel(ctx context.Context, input createImageJobInput) (*database.ImageJob, error) {
	account, err := s.findProviderAccountByID(ctx, input.ProviderAccountID)
	if err != nil {
		return nil, err
	}
	if account.WorkspaceID != input.WorkspaceID {
		return nil, ErrForbidden
	}
	if account.Status != accountStatusReady && account.Status != accountStatusBusy {
		return nil, fmt.Errorf("%w: provider account must be connected before running", ErrConflict)
	}
	promptText := strings.TrimSpace(input.PromptText)
	if promptText == "" {
		return nil, fmt.Errorf("%w: prompt text is required", ErrValidation)
	}
	now := time.Now().UTC()
	job := &database.ImageJob{
		ID:                uuid.New(),
		WorkspaceID:       input.WorkspaceID,
		ProviderAccountID: input.ProviderAccountID,
		BatchID:           input.BatchID,
		APIKeyID:          input.APIKeyID,
		Source:            input.Source,
		RequestType:       input.RequestType,
		Title:             strings.TrimSpace(input.Title),
		PromptText:        promptText,
		AspectRatio:       strings.TrimSpace(input.AspectRatio),
		Status:            runStatusQueued,
		QueuedAt:          now,
		CreatedAt:         now,
		UpdatedAt:         now,
	}
	if _, err := s.db.NewInsert().Model(job).Exec(ctx); err != nil {
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
	return job, nil
}

func (s *Service) SetImageJobWorkerState(ctx context.Context, jobID uuid.UUID, workerRunID, status string) error {
	query := s.db.NewUpdate().
		Model((*database.ImageJob)(nil)).
		Set("updated_at = ?", time.Now().UTC())
	if strings.TrimSpace(workerRunID) != "" {
		query = query.Set("worker_run_id = ?", workerRunID)
	}
	if strings.TrimSpace(status) != "" {
		query = query.Set("status = ?", status)
	}
	_, err := query.Where("id = ?", jobID).Exec(ctx)
	return err
}

func (s *Service) ListWorkspaceAPIKeys(ctx context.Context, principal *Principal, workspaceID uuid.UUID) ([]WorkspaceAPIKeyRecord, error) {
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, workspaceID, "workspace.api.view", "automations.view"); err != nil {
		return nil, err
	}
	var keys []database.WorkspaceAPIKey
	if err := s.db.NewSelect().
		Model(&keys).
		Where("workspace_id = ?", workspaceID).
		OrderExpr("created_at DESC").
		Scan(ctx); err != nil {
		return nil, err
	}
	items := make([]WorkspaceAPIKeyRecord, 0, len(keys))
	for _, key := range keys {
		record, err := workspaceAPIKeyRecordFromModel(key)
		if err != nil {
			return nil, err
		}
		items = append(items, record)
	}
	return items, nil
}

func (s *Service) CreateWorkspaceAPIKey(
	ctx context.Context,
	principal *Principal,
	workspaceID uuid.UUID,
	name string,
	scopes []string,
	requestsPerMinute, dailyImageQuota int,
) (*CreatedWorkspaceAPIKeyRecord, error) {
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, workspaceID, "workspace.api.manage", "automations.manage"); err != nil {
		return nil, err
	}
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, fmt.Errorf("%w: api key name is required", ErrValidation)
	}
	resolvedScopes := normalizeAPIKeyScopes(scopes)
	if len(resolvedScopes) == 0 {
		return nil, fmt.Errorf("%w: at least one api key scope is required", ErrValidation)
	}
	if requestsPerMinute <= 0 || dailyImageQuota <= 0 {
		return nil, fmt.Errorf("%w: api key quotas must be positive", ErrValidation)
	}
	secret, prefix, hash, err := generateWorkspaceAPIKeySecret()
	if err != nil {
		return nil, err
	}
	scopesJSON, err := json.Marshal(resolvedScopes)
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	key := &database.WorkspaceAPIKey{
		ID:                uuid.New(),
		WorkspaceID:       workspaceID,
		Name:              name,
		KeyPrefix:         prefix,
		KeyHash:           hash,
		Status:            apiKeyStatusActive,
		ScopesJSON:        string(scopesJSON),
		RequestsPerMinute: requestsPerMinute,
		DailyImageQuota:   dailyImageQuota,
		CreatedByUserID:   &principal.UserID,
		CreatedAt:         now,
		UpdatedAt:         now,
	}
	if _, err := s.db.NewInsert().Model(key).Exec(ctx); err != nil {
		return nil, err
	}
	record, err := workspaceAPIKeyRecordFromModel(*key)
	if err != nil {
		return nil, err
	}
	return &CreatedWorkspaceAPIKeyRecord{
		APIKey: record,
		Secret: secret,
	}, nil
}

func (s *Service) RevokeWorkspaceAPIKey(ctx context.Context, principal *Principal, keyID uuid.UUID) (*WorkspaceAPIKeyRecord, error) {
	key, err := s.findWorkspaceAPIKeyByID(ctx, keyID)
	if err != nil {
		return nil, err
	}
	if _, err := s.requireWorkspacePermissionFallback(ctx, principal, key.WorkspaceID, "workspace.api.manage", "automations.manage"); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	key.Status = apiKeyStatusRevoked
	key.RevokedAt = &now
	key.UpdatedAt = now
	if _, err := s.db.NewUpdate().
		Model(key).
		Column("status", "revoked_at", "updated_at").
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}
	record, err := workspaceAPIKeyRecordFromModel(*key)
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (s *Service) AuthenticateWorkspaceAPIKey(ctx context.Context, secret string) (*database.WorkspaceAPIKey, error) {
	hash := hashWorkspaceAPIKey(secret)
	var key database.WorkspaceAPIKey
	if err := s.db.NewSelect().
		Model(&key).
		Where("key_hash = ?", hash).
		Where("status = ?", apiKeyStatusActive).
		Limit(1).
		Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUnauthorized
		}
		return nil, err
	}
	return &key, nil
}

func (s *Service) CreateAPIImageJob(
	ctx context.Context,
	key *database.WorkspaceAPIKey,
	ipAddress, title, promptText, aspectRatio string,
) (*ImageJobDispatch, error) {
	scopes, err := decodeWorkspaceAPIKeyScopes(key.ScopesJSON)
	if err != nil {
		return nil, err
	}
	if !containsString(scopes, "images.generate") {
		return nil, ErrForbidden
	}
	if err := s.ensureWorkspaceAPIKeyQuota(ctx, key, 1); err != nil {
		return nil, err
	}
	account, err := s.findDefaultAPIProviderAccount(ctx, key.WorkspaceID)
	if err != nil {
		return nil, err
	}
	job, err := s.createImageJobModel(ctx, createImageJobInput{
		WorkspaceID:       key.WorkspaceID,
		ProviderAccountID: account.ID,
		APIKeyID:          &key.ID,
		Source:            imageSourceAPI,
		RequestType:       imageRequestTypeSingle,
		Title:             title,
		PromptText:        promptText,
		AspectRatio:       aspectRatio,
	})
	if err != nil {
		return nil, err
	}
	if err := s.touchWorkspaceAPIKeyUsage(ctx, key.ID, ipAddress); err != nil {
		return nil, err
	}
	record, err := s.imageJobRecordFromModel(ctx, *job)
	if err != nil {
		return nil, err
	}
	return &ImageJobDispatch{
		Job:     record,
		Account: providerAccountRecordFromModel(*account),
	}, nil
}

func (s *Service) CreateAPIImageBatch(
	ctx context.Context,
	key *database.WorkspaceAPIKey,
	ipAddress, title, promptTemplate, placeholderName, aspectRatio string,
	values []string,
) (*ImageBatchResult, []ImageJobDispatch, error) {
	scopes, err := decodeWorkspaceAPIKeyScopes(key.ScopesJSON)
	if err != nil {
		return nil, nil, err
	}
	if !containsString(scopes, "images.generate") {
		return nil, nil, ErrForbidden
	}
	trimmedValues := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value != "" {
			trimmedValues = append(trimmedValues, value)
		}
	}
	if len(trimmedValues) == 0 {
		return nil, nil, fmt.Errorf("%w: at least one batch value is required", ErrValidation)
	}
	if err := s.ensureWorkspaceAPIKeyQuota(ctx, key, len(trimmedValues)); err != nil {
		return nil, nil, err
	}
	account, err := s.findDefaultAPIProviderAccount(ctx, key.WorkspaceID)
	if err != nil {
		return nil, nil, err
	}
	now := time.Now().UTC()
	placeholderName = strings.TrimSpace(placeholderName)
	if placeholderName == "" {
		placeholderName = "item"
	}
	batch := &database.ImageBatch{
		ID:                uuid.New(),
		WorkspaceID:       key.WorkspaceID,
		ProviderAccountID: account.ID,
		Title:             strings.TrimSpace(title),
		PromptTemplate:    strings.TrimSpace(promptTemplate),
		PlaceholderName:   placeholderName,
		Source:            imageSourceAPI,
		Status:            runStatusQueued,
		APIKeyID:          &key.ID,
		CreatedAt:         now,
		UpdatedAt:         now,
	}
	if _, err := s.db.NewInsert().Model(batch).Exec(ctx); err != nil {
		return nil, nil, err
	}
	dispatches := make([]ImageJobDispatch, 0, len(trimmedValues))
	records := make([]ImageJobRecord, 0, len(trimmedValues))
	for _, value := range trimmedValues {
		jobTitle := strings.TrimSpace(title)
		if jobTitle != "" {
			jobTitle = fmt.Sprintf("%s · %s", jobTitle, value)
		} else {
			jobTitle = value
		}
		job, err := s.createImageJobModel(ctx, createImageJobInput{
			WorkspaceID:       key.WorkspaceID,
			ProviderAccountID: account.ID,
			BatchID:           &batch.ID,
			APIKeyID:          &key.ID,
			Source:            imageSourceAPI,
			RequestType:       imageRequestTypeBatch,
			Title:             jobTitle,
			PromptText:        applyBatchTemplate(promptTemplate, placeholderName, value),
			AspectRatio:       aspectRatio,
		})
		if err != nil {
			return nil, nil, err
		}
		record, err := s.imageJobRecordFromModel(ctx, *job)
		if err != nil {
			return nil, nil, err
		}
		records = append(records, record)
		dispatches = append(dispatches, ImageJobDispatch{
			Job:     record,
			Account: providerAccountRecordFromModel(*account),
		})
	}
	if err := s.touchWorkspaceAPIKeyUsage(ctx, key.ID, ipAddress); err != nil {
		return nil, nil, err
	}
	return &ImageBatchResult{
		Batch: imageBatchRecordFromModel(*batch),
		Jobs:  records,
	}, dispatches, nil
}

func (s *Service) GetAPIImageJob(ctx context.Context, key *database.WorkspaceAPIKey, jobID uuid.UUID) (*ImageJobRecord, error) {
	scopes, err := decodeWorkspaceAPIKeyScopes(key.ScopesJSON)
	if err != nil {
		return nil, err
	}
	if !containsString(scopes, "images.read") {
		return nil, ErrForbidden
	}
	job, err := s.findImageJobByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if job.WorkspaceID != key.WorkspaceID {
		return nil, ErrForbidden
	}
	record, err := s.imageJobRecordFromModel(ctx, *job)
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (s *Service) ListAPIImageOutputs(ctx context.Context, key *database.WorkspaceAPIKey, jobID uuid.UUID) ([]ImageOutputRecord, error) {
	scopes, err := decodeWorkspaceAPIKeyScopes(key.ScopesJSON)
	if err != nil {
		return nil, err
	}
	if !containsString(scopes, "images.read") {
		return nil, ErrForbidden
	}
	job, err := s.findImageJobByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if job.WorkspaceID != key.WorkspaceID {
		return nil, ErrForbidden
	}
	return s.listImageOutputsByJobID(ctx, job.ID)
}

func (s *Service) ensureWorkspaceAPIKeyQuota(ctx context.Context, key *database.WorkspaceAPIKey, requestedImages int) error {
	now := time.Now().UTC()
	minuteWindowStart := now.Add(-1 * time.Minute)
	recentRequests, err := s.db.NewSelect().
		Model((*database.ImageJob)(nil)).
		Where("api_key_id = ?", key.ID).
		Where("source = ?", imageSourceAPI).
		Where("queued_at >= ?", minuteWindowStart).
		Count(ctx)
	if err != nil {
		return err
	}
	if recentRequests+requestedImages > key.RequestsPerMinute {
		return fmt.Errorf("%w: api key exceeded requests-per-minute quota", ErrConflict)
	}
	dayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	dailyCount, err := s.db.NewSelect().
		Model((*database.ImageJob)(nil)).
		Where("api_key_id = ?", key.ID).
		Where("source = ?", imageSourceAPI).
		Where("queued_at >= ?", dayStart).
		Count(ctx)
	if err != nil {
		return err
	}
	if dailyCount+requestedImages > key.DailyImageQuota {
		return fmt.Errorf("%w: api key exceeded daily image quota", ErrConflict)
	}
	return nil
}

func (s *Service) touchWorkspaceAPIKeyUsage(ctx context.Context, keyID uuid.UUID, ipAddress string) error {
	now := time.Now().UTC()
	_, err := s.db.NewUpdate().
		Model((*database.WorkspaceAPIKey)(nil)).
		Set("last_used_at = ?", now).
		Set("last_used_ip = ?", normalizeIPAddress(ipAddress)).
		Set("updated_at = ?", now).
		Where("id = ?", keyID).
		Exec(ctx)
	return err
}

func (s *Service) findDefaultAPIProviderAccount(ctx context.Context, workspaceID uuid.UUID) (*database.ProviderAccount, error) {
	var account database.ProviderAccount
	err := s.db.NewSelect().
		Model(&account).
		Where("workspace_id = ?", workspaceID).
		Where("status IN (?, ?)", accountStatusReady, accountStatusBusy).
		OrderExpr("CASE WHEN is_default_for_api THEN 0 ELSE 1 END ASC").
		OrderExpr("created_at ASC").
		Limit(1).
		Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("%w: no connected provider account is available for api image generation", ErrConflict)
		}
		return nil, err
	}
	return &account, nil
}

func (s *Service) imageJobRecordFromModel(ctx context.Context, model database.ImageJob) (ImageJobRecord, error) {
	account, err := s.findProviderAccountByID(ctx, model.ProviderAccountID)
	if err != nil {
		return ImageJobRecord{}, err
	}
	outputCount, err := s.db.NewSelect().
		Model((*database.ImageOutput)(nil)).
		Where("image_job_id = ?", model.ID).
		Count(ctx)
	if err != nil {
		return ImageJobRecord{}, err
	}
	record := ImageJobRecord{
		ID:                model.ID.String(),
		WorkspaceID:       model.WorkspaceID.String(),
		ProviderAccountID: model.ProviderAccountID.String(),
		Provider:          account.Provider,
		ProviderLabel:     account.Label,
		Source:            model.Source,
		RequestType:       model.RequestType,
		Title:             model.Title,
		PromptText:        model.PromptText,
		AspectRatio:       model.AspectRatio,
		Status:            model.Status,
		WorkerRunID:       model.WorkerRunID,
		ProviderThreadURL: model.ProviderThreadURL,
		ProviderThreadID:  model.ProviderThreadID,
		QueuedAt:          model.QueuedAt.Format(time.RFC3339),
		LastError:         model.LastError,
		OutputCount:       outputCount,
	}
	if model.BatchID != nil {
		record.BatchID = model.BatchID.String()
	}
	if model.APIKeyID != nil {
		record.APIKeyID = model.APIKeyID.String()
	}
	if model.StartedAt != nil {
		record.StartedAt = model.StartedAt.Format(time.RFC3339)
	}
	if model.CompletedAt != nil {
		record.CompletedAt = model.CompletedAt.Format(time.RFC3339)
	}
	return record, nil
}

func (s *Service) imageJobRecordsFromModels(ctx context.Context, models []database.ImageJob) ([]ImageJobRecord, error) {
	items := make([]ImageJobRecord, 0, len(models))
	for _, model := range models {
		record, err := s.imageJobRecordFromModel(ctx, model)
		if err != nil {
			return nil, err
		}
		items = append(items, record)
	}
	return items, nil
}

func imageBatchRecordFromModel(model database.ImageBatch) ImageBatchRecord {
	return ImageBatchRecord{
		ID:                model.ID.String(),
		WorkspaceID:       model.WorkspaceID.String(),
		ProviderAccountID: model.ProviderAccountID.String(),
		Title:             model.Title,
		PromptTemplate:    model.PromptTemplate,
		PlaceholderName:   model.PlaceholderName,
		Source:            model.Source,
		Status:            model.Status,
		CreatedAt:         model.CreatedAt.Format(time.RFC3339),
		UpdatedAt:         model.UpdatedAt.Format(time.RFC3339),
	}
}

func imageOutputRecordFromModel(model database.ImageOutput) ImageOutputRecord {
	return ImageOutputRecord{
		ID:               model.ID.String(),
		ImageJobID:       model.ImageJobID.String(),
		WorkspaceID:      model.WorkspaceID.String(),
		StoragePath:      model.StoragePath,
		MimeType:         model.MimeType,
		ByteSize:         model.ByteSize,
		Width:            model.Width,
		Height:           model.Height,
		SHA256:           model.SHA256,
		ProviderAssetURL: model.ProviderAssetURL,
		CreatedAt:        model.CreatedAt.Format(time.RFC3339),
		ContentURL:       fmt.Sprintf("/api/v1/image-outputs/%s/content", model.ID),
	}
}

func workspaceAPIKeyRecordFromModel(model database.WorkspaceAPIKey) (WorkspaceAPIKeyRecord, error) {
	scopes, err := decodeWorkspaceAPIKeyScopes(model.ScopesJSON)
	if err != nil {
		return WorkspaceAPIKeyRecord{}, err
	}
	record := WorkspaceAPIKeyRecord{
		ID:                model.ID.String(),
		WorkspaceID:       model.WorkspaceID.String(),
		Name:              model.Name,
		KeyPrefix:         model.KeyPrefix,
		Status:            model.Status,
		Scopes:            scopes,
		RequestsPerMinute: model.RequestsPerMinute,
		DailyImageQuota:   model.DailyImageQuota,
		LastUsedIP:        model.LastUsedIP,
		CreatedAt:         model.CreatedAt.Format(time.RFC3339),
		UpdatedAt:         model.UpdatedAt.Format(time.RFC3339),
	}
	if model.LastUsedAt != nil {
		record.LastUsedAt = model.LastUsedAt.Format(time.RFC3339)
	}
	return record, nil
}

func normalizeAPIKeyScopes(scopes []string) []string {
	resolved := make([]string, 0, len(scopes))
	seen := map[string]bool{}
	for _, scope := range scopes {
		scope = strings.TrimSpace(scope)
		if scope == "" || seen[scope] {
			continue
		}
		switch scope {
		case "images.generate", "images.read":
			resolved = append(resolved, scope)
			seen[scope] = true
		}
	}
	return resolved
}

func decodeWorkspaceAPIKeyScopes(raw string) ([]string, error) {
	var scopes []string
	if strings.TrimSpace(raw) == "" {
		return scopes, nil
	}
	if err := json.Unmarshal([]byte(raw), &scopes); err != nil {
		return nil, err
	}
	return normalizeAPIKeyScopes(scopes), nil
}

func containsString(items []string, expected string) bool {
	for _, item := range items {
		if item == expected {
			return true
		}
	}
	return false
}

func applyBatchTemplate(promptTemplate, placeholderName, value string) string {
	value = strings.TrimSpace(value)
	replacement := "{{" + strings.TrimSpace(placeholderName) + "}}"
	result := strings.ReplaceAll(promptTemplate, replacement, value)
	if result == promptTemplate {
		return fmt.Sprintf("%s\n\n%s: %s", strings.TrimSpace(promptTemplate), placeholderName, value)
	}
	return result
}

func generateWorkspaceAPIKeySecret() (secret string, prefix string, hash string, err error) {
	randomBytes := make([]byte, 24)
	if _, err = rand.Read(randomBytes); err != nil {
		return "", "", "", err
	}
	encoded := hex.EncodeToString(randomBytes)
	secret = "bsk_live_" + encoded
	prefix = secret
	if len(prefix) > 18 {
		prefix = prefix[:18] + "..."
	}
	hash = hashWorkspaceAPIKey(secret)
	return secret, prefix, hash, nil
}

func hashWorkspaceAPIKey(secret string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(secret)))
	return hex.EncodeToString(sum[:])
}

func normalizeIPAddress(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	host, _, err := net.SplitHostPort(value)
	if err == nil {
		return host
	}
	return value
}

func (s *Service) findImageJobByID(ctx context.Context, jobID uuid.UUID) (*database.ImageJob, error) {
	var job database.ImageJob
	if err := s.db.NewSelect().Model(&job).Where("id = ?", jobID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &job, nil
}

func (s *Service) findImageOutputByID(ctx context.Context, outputID uuid.UUID) (*database.ImageOutput, error) {
	var output database.ImageOutput
	if err := s.db.NewSelect().Model(&output).Where("id = ?", outputID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &output, nil
}

func (s *Service) findWorkspaceAPIKeyByID(ctx context.Context, keyID uuid.UUID) (*database.WorkspaceAPIKey, error) {
	var key database.WorkspaceAPIKey
	if err := s.db.NewSelect().Model(&key).Where("id = ?", keyID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &key, nil
}

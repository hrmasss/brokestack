package iam

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"

	"github.com/brokestack/api/internal/auth"
	"github.com/brokestack/api/internal/config"
	"github.com/brokestack/api/internal/database"
)

var slugPattern = regexp.MustCompile(`[^a-z0-9]+`)

var (
	ErrUnauthorized       = errors.New("unauthorized")
	ErrForbidden          = errors.New("forbidden")
	ErrNotFound           = errors.New("not found")
	ErrConflict           = errors.New("conflict")
	ErrValidation         = errors.New("validation failed")
	ErrLastWorkspaceOwner = errors.New("workspace must retain at least one owner")
)

type Service struct {
	db  *bun.DB
	cfg *config.Config
}

type Principal struct {
	UserID             uuid.UUID
	Portal             string
	SessionID          uuid.UUID
	AssumedWorkspaceID *uuid.UUID
	ImpersonatorUserID *uuid.UUID
}

type APIUser struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	FullName  string `json:"fullName"`
	Status    string `json:"status"`
	CreatedAt string `json:"createdAt"`
}

type APIPermission struct {
	Code        string `json:"code"`
	Label       string `json:"label"`
	Scope       string `json:"scope"`
	Description string `json:"description"`
}

type APIRole struct {
	ID          string          `json:"id"`
	Code        string          `json:"code"`
	Label       string          `json:"label"`
	Scope       string          `json:"scope"`
	Permissions []APIPermission `json:"permissions,omitempty"`
}

type WorkspaceMembershipSummary struct {
	ID              string    `json:"id"`
	WorkspaceID     string    `json:"workspaceId"`
	WorkspaceName   string    `json:"workspaceName"`
	WorkspaceSlug   string    `json:"workspaceSlug"`
	WorkspaceStatus string    `json:"workspaceStatus"`
	Status          string    `json:"status"`
	Roles           []APIRole `json:"roles"`
}

type AuthSessionResponse struct {
	Portal               string                       `json:"portal"`
	AccessToken          string                       `json:"accessToken,omitempty"`
	User                 APIUser                      `json:"user"`
	Impersonator         *APIUser                     `json:"impersonator,omitempty"`
	PlatformRoles        []APIRole                    `json:"platformRoles"`
	PlatformPermissions  []APIPermission              `json:"platformPermissions"`
	WorkspaceMemberships []WorkspaceMembershipSummary `json:"workspaceMemberships"`
	AssumedWorkspaceID   string                       `json:"assumedWorkspaceId,omitempty"`
}

type WorkspaceSummary struct {
	ID           string                      `json:"id"`
	Name         string                      `json:"name"`
	Slug         string                      `json:"slug"`
	Status       string                      `json:"status"`
	Capabilities []APIPermission             `json:"capabilities"`
	Membership   *WorkspaceMembershipSummary `json:"membership,omitempty"`
}

type WorkspaceMemberRecord struct {
	MembershipID string    `json:"membershipId"`
	User         APIUser   `json:"user"`
	Status       string    `json:"status"`
	Roles        []APIRole `json:"roles"`
}

type WorkspaceInviteRecord struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Status    string    `json:"status"`
	ExpiresAt string    `json:"expiresAt"`
	CreatedAt string    `json:"createdAt"`
	Roles     []APIRole `json:"roles"`
}

type PlatformUserRecord struct {
	User                 APIUser                      `json:"user"`
	PlatformRoles        []APIRole                    `json:"platformRoles"`
	WorkspaceCount       int                          `json:"workspaceCount"`
	WorkspaceMemberships []WorkspaceMembershipSummary `json:"workspaceMemberships,omitempty"`
}

type PlatformWorkspaceRecord struct {
	ID                string `json:"id"`
	Name              string `json:"name"`
	Slug              string `json:"slug"`
	Status            string `json:"status"`
	MemberCount       int    `json:"memberCount"`
	ActiveMemberCount int    `json:"activeMemberCount"`
}

func NewService(db *bun.DB, cfg *config.Config) *Service {
	return &Service{db: db, cfg: cfg}
}

func (s *Service) SeedSystem(ctx context.Context) error {
	return database.SeedSystem(ctx, s.db, s.cfg)
}

func (s *Service) CheckHealth(ctx context.Context) error {
	_, err := s.db.ExecContext(ctx, "SELECT 1")
	return err
}

func (s *Service) BuildPrincipal(token string) (*Principal, error) {
	claims, err := auth.ParseAccessToken(s.cfg.Auth.JWTSecret, token)
	if err != nil {
		return nil, ErrUnauthorized
	}
	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return nil, ErrUnauthorized
	}
	sessionID, err := uuid.Parse(claims.SessionID)
	if err != nil {
		return nil, ErrUnauthorized
	}

	var assumedWorkspaceID *uuid.UUID
	if claims.AssumedWorkspaceID != "" {
		parsed, err := uuid.Parse(claims.AssumedWorkspaceID)
		if err != nil {
			return nil, ErrUnauthorized
		}
		assumedWorkspaceID = &parsed
	}
	var impersonatorUserID *uuid.UUID
	if claims.ImpersonatorUserID != "" {
		parsed, err := uuid.Parse(claims.ImpersonatorUserID)
		if err != nil {
			return nil, ErrUnauthorized
		}
		impersonatorUserID = &parsed
	}

	return &Principal{
		UserID:             userID,
		Portal:             claims.Portal,
		SessionID:          sessionID,
		AssumedWorkspaceID: assumedWorkspaceID,
		ImpersonatorUserID: impersonatorUserID,
	}, nil
}

func (s *Service) Register(ctx context.Context, fullName, email, password, workspaceName string) (*AuthSessionResponse, string, error) {
	fullName = strings.TrimSpace(fullName)
	email = normalizeEmail(email)
	workspaceName = strings.TrimSpace(workspaceName)
	if fullName == "" || email == "" || password == "" {
		return nil, "", fmt.Errorf("%w: full name, email, and password are required", ErrValidation)
	}
	if workspaceName == "" {
		workspaceName = defaultWorkspaceName(fullName)
	}

	if _, err := s.findUserByEmail(ctx, email); err == nil {
		return nil, "", fmt.Errorf("%w: email already exists", ErrConflict)
	} else if !errors.Is(err, ErrNotFound) {
		return nil, "", err
	}

	passwordHash, err := auth.HashPassword(password)
	if err != nil {
		return nil, "", err
	}

	user := &database.User{
		ID:           uuid.New(),
		Email:        email,
		FullName:     fullName,
		PasswordHash: passwordHash,
		Status:       "active",
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(user).Exec(ctx); err != nil {
		return nil, "", err
	}

	_, membership, err := s.createWorkspaceMembership(ctx, user.ID, workspaceName, nil)
	if err != nil {
		return nil, "", err
	}
	if err := s.assignWorkspaceRolesByCode(ctx, membership.ID, []string{"workspace_owner"}); err != nil {
		return nil, "", err
	}

	return s.createSessionResponse(ctx, user, auth.PortalCustomer, nil, nil)
}

func (s *Service) CustomerLogin(ctx context.Context, email, password string) (*AuthSessionResponse, string, error) {
	user, err := s.findUserByEmail(ctx, normalizeEmail(email))
	if err != nil {
		return nil, "", err
	}
	if user.Status != "active" || !auth.CheckPassword(user.PasswordHash, password) {
		return nil, "", ErrUnauthorized
	}
	return s.createSessionResponse(ctx, user, auth.PortalCustomer, nil, nil)
}

func (s *Service) PlatformLogin(ctx context.Context, email, password string) (*AuthSessionResponse, string, error) {
	user, err := s.findUserByEmail(ctx, normalizeEmail(email))
	if err != nil {
		return nil, "", err
	}
	if user.Status != "active" || !auth.CheckPassword(user.PasswordHash, password) {
		return nil, "", ErrUnauthorized
	}
	roles, err := s.listPlatformRolesForUser(ctx, user.ID)
	if err != nil {
		return nil, "", err
	}
	if len(roles) == 0 {
		return nil, "", ErrForbidden
	}
	return s.createSessionResponse(ctx, user, auth.PortalPlatform, nil, nil)
}

func (s *Service) RefreshSession(ctx context.Context, portal, refreshToken string) (*AuthSessionResponse, string, error) {
	if refreshToken == "" {
		return nil, "", ErrUnauthorized
	}

	var session database.AuthSession
	if err := s.db.NewSelect().
		Model(&session).
		Where("refresh_token_hash = ?", auth.HashRefreshToken(refreshToken)).
		Limit(1).
		Scan(ctx); err != nil {
		return nil, "", ErrUnauthorized
	}
	if session.Scope != portal || session.RevokedAt != nil || session.ExpiresAt.Before(time.Now().UTC()) {
		return nil, "", ErrUnauthorized
	}

	now := time.Now().UTC()
	if _, err := s.db.NewUpdate().
		Model((*database.AuthSession)(nil)).
		Set("revoked_at = ?", now).
		Set("updated_at = ?", now).
		Where("id = ?", session.ID).
		Exec(ctx); err != nil {
		return nil, "", err
	}

	user, err := s.findUserByID(ctx, session.UserID)
	if err != nil {
		return nil, "", err
	}
	return s.createSessionResponse(ctx, user, portal, session.AssumedWorkspaceID, session.ImpersonatorUserID)
}

func (s *Service) LogoutSession(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return nil
	}
	now := time.Now().UTC()
	_, err := s.db.NewUpdate().
		Model((*database.AuthSession)(nil)).
		Set("revoked_at = ?", now).
		Set("updated_at = ?", now).
		Where("refresh_token_hash = ?", auth.HashRefreshToken(refreshToken)).
		Exec(ctx)
	return err
}

func (s *Service) Me(ctx context.Context, principal *Principal) (*AuthSessionResponse, error) {
	user, err := s.findUserByID(ctx, principal.UserID)
	if err != nil {
		return nil, err
	}
	return s.buildAuthPayload(ctx, user, principal.Portal, principal.AssumedWorkspaceID, principal.ImpersonatorUserID, "")
}

func (s *Service) PlatformMe(ctx context.Context, principal *Principal) (*AuthSessionResponse, error) {
	if principal.Portal != auth.PortalPlatform {
		return nil, ErrForbidden
	}
	return s.Me(ctx, principal)
}

func (s *Service) createSessionResponse(ctx context.Context, user *database.User, portal string, assumedWorkspaceID *uuid.UUID, impersonatorUserID *uuid.UUID) (*AuthSessionResponse, string, error) {
	refreshPlain, refreshHash, err := auth.NewRefreshToken()
	if err != nil {
		return nil, "", err
	}

	session := &database.AuthSession{
		ID:                 uuid.New(),
		UserID:             user.ID,
		ImpersonatorUserID: impersonatorUserID,
		Scope:              portal,
		RefreshTokenHash:   refreshHash,
		ExpiresAt:          time.Now().UTC().Add(s.cfg.Auth.RefreshTokenTTL),
		AssumedWorkspaceID: assumedWorkspaceID,
		CreatedAt:          time.Now().UTC(),
		UpdatedAt:          time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(session).Exec(ctx); err != nil {
		return nil, "", err
	}

	accessToken, err := auth.IssueAccessToken(s.cfg.Auth.JWTSecret, user.ID, session.ID, portal, s.cfg.Auth.AccessTokenTTL, assumedWorkspaceID, impersonatorUserID)
	if err != nil {
		return nil, "", err
	}

	response, err := s.buildAuthPayload(ctx, user, portal, assumedWorkspaceID, impersonatorUserID, accessToken)
	if err != nil {
		return nil, "", err
	}
	return response, refreshPlain, nil
}

func (s *Service) buildAuthPayload(ctx context.Context, user *database.User, portal string, assumedWorkspaceID *uuid.UUID, impersonatorUserID *uuid.UUID, accessToken string) (*AuthSessionResponse, error) {
	platformRoles, err := s.listPlatformRolesForUser(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	if platformRoles == nil {
		platformRoles = []APIRole{}
	}
	platformPermissions, err := s.listPlatformPermissionsForUser(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	if platformPermissions == nil {
		platformPermissions = []APIPermission{}
	}
	memberships, err := s.listWorkspaceMembershipSummaries(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	response := &AuthSessionResponse{
		Portal:               portal,
		AccessToken:          accessToken,
		User:                 apiUserFromModel(*user),
		PlatformRoles:        platformRoles,
		PlatformPermissions:  platformPermissions,
		WorkspaceMemberships: memberships,
	}
	if assumedWorkspaceID != nil {
		response.AssumedWorkspaceID = assumedWorkspaceID.String()
	}
	if impersonatorUserID != nil {
		impersonator, err := s.findUserByID(ctx, *impersonatorUserID)
		if err != nil {
			return nil, err
		}
		actor := apiUserFromModel(*impersonator)
		response.Impersonator = &actor
	}
	return response, nil
}

func (s *Service) findUserByEmail(ctx context.Context, email string) (*database.User, error) {
	var user database.User
	if err := s.db.NewSelect().Model(&user).Where("email = ?", email).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (s *Service) findUserByID(ctx context.Context, userID uuid.UUID) (*database.User, error) {
	var user database.User
	if err := s.db.NewSelect().Model(&user).Where("id = ?", userID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (s *Service) findWorkspaceByID(ctx context.Context, workspaceID uuid.UUID) (*database.Workspace, error) {
	var workspace database.Workspace
	if err := s.db.NewSelect().Model(&workspace).Where("id = ?", workspaceID).Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &workspace, nil
}

func apiUserFromModel(user database.User) APIUser {
	return APIUser{
		ID:        user.ID.String(),
		Email:     user.Email,
		FullName:  user.FullName,
		Status:    user.Status,
		CreatedAt: user.CreatedAt.Format(time.RFC3339),
	}
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = slugPattern.ReplaceAllString(value, "-")
	return strings.Trim(value, "-")
}

func defaultWorkspaceName(fullName string) string {
	trimmedName := strings.TrimSpace(fullName)
	if trimmedName == "" {
		return "User's Workspace"
	}
	if strings.HasSuffix(strings.ToLower(trimmedName), "s") {
		return fmt.Sprintf("%s' Workspace", trimmedName)
	}
	return fmt.Sprintf("%s's Workspace", trimmedName)
}

func uniqueStrings(values []string) []string {
	result := make([]string, 0, len(values))
	for _, value := range values {
		if !slices.Contains(result, value) {
			result = append(result, value)
		}
	}
	return result
}

func sameStringSet(left, right []string) bool {
	left = uniqueStrings(left)
	right = uniqueStrings(right)
	if len(left) != len(right) {
		return false
	}
	for _, value := range left {
		if !slices.Contains(right, value) {
			return false
		}
	}
	return true
}

func hasAccessibleWorkspaceMembership(memberships []WorkspaceMembershipSummary) bool {
	for _, membership := range memberships {
		if membership.Status == "active" && membership.WorkspaceStatus == "active" {
			return true
		}
	}
	return false
}

func (s *Service) ListWorkspaces(ctx context.Context, principal *Principal) ([]WorkspaceMembershipSummary, error) {
	summary, err := s.Me(ctx, principal)
	if err != nil {
		return nil, err
	}
	return summary.WorkspaceMemberships, nil
}

func (s *Service) CreateWorkspace(ctx context.Context, principal *Principal, name string) (*WorkspaceSummary, error) {
	user, err := s.findUserByID(ctx, principal.UserID)
	if err != nil {
		return nil, err
	}
	workspace, membership, err := s.createWorkspaceMembership(ctx, user.ID, name, &user.ID)
	if err != nil {
		return nil, err
	}
	if err := s.assignWorkspaceRolesByCode(ctx, membership.ID, []string{"workspace_owner"}); err != nil {
		return nil, err
	}
	return s.GetWorkspace(ctx, principal, workspace.ID)
}

func (s *Service) GetWorkspace(ctx context.Context, principal *Principal, workspaceID uuid.UUID) (*WorkspaceSummary, error) {
	workspace, err := s.findWorkspaceByID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	permissions, err := s.requireWorkspaceAccess(ctx, principal, workspace.ID, "workspace.settings.view")
	if err != nil {
		return nil, err
	}
	membership, _ := s.findWorkspaceMembership(ctx, principal.UserID, workspace.ID)
	var membershipSummary *WorkspaceMembershipSummary
	if membership != nil {
		summary, err := s.membershipToSummary(ctx, *membership, *workspace)
		if err != nil {
			return nil, err
		}
		membershipSummary = &summary
	}
	return &WorkspaceSummary{
		ID:           workspace.ID.String(),
		Name:         workspace.Name,
		Slug:         workspace.Slug,
		Status:       workspace.Status,
		Capabilities: permissions,
		Membership:   membershipSummary,
	}, nil
}

func (s *Service) UpdateWorkspace(ctx context.Context, principal *Principal, workspaceID uuid.UUID, name, status string) (*WorkspaceSummary, error) {
	_, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "workspace.settings.manage")
	if err != nil {
		return nil, err
	}
	workspace, err := s.findWorkspaceByID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(name) != "" {
		workspace.Name = strings.TrimSpace(name)
		workspace.Slug, err = s.ensureWorkspaceSlug(ctx, workspace.Name, workspace.ID)
		if err != nil {
			return nil, err
		}
	}
	if status != "" {
		workspace.Status = status
	}
	workspace.UpdatedAt = time.Now().UTC()
	if _, err := s.db.NewUpdate().Model(workspace).Column("name", "slug", "status", "updated_at").WherePK().Exec(ctx); err != nil {
		return nil, err
	}
	return s.GetWorkspace(ctx, principal, workspaceID)
}

func (s *Service) ListWorkspaceMembers(ctx context.Context, principal *Principal, workspaceID uuid.UUID) ([]WorkspaceMemberRecord, error) {
	_, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "workspace.members.view")
	if err != nil {
		return nil, err
	}

	type memberRow struct {
		MembershipID uuid.UUID `bun:"membership_id"`
		Status       string    `bun:"status"`
		UserID       uuid.UUID `bun:"user_id"`
		Email        string    `bun:"email"`
		FullName     string    `bun:"full_name"`
		UserStatus   string    `bun:"user_status"`
		CreatedAt    time.Time `bun:"created_at"`
	}
	var rows []memberRow
	if err := s.db.NewSelect().
		TableExpr("workspace_memberships AS wm").
		ColumnExpr("wm.id AS membership_id").
		ColumnExpr("wm.status AS status").
		ColumnExpr("u.id AS user_id").
		ColumnExpr("u.email").
		ColumnExpr("u.full_name").
		ColumnExpr("u.status AS user_status").
		ColumnExpr("u.created_at").
		Join("JOIN users AS u ON u.id = wm.user_id").
		Where("wm.workspace_id = ?", workspaceID).
		OrderExpr("u.created_at ASC").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}

	membershipIDs := make([]string, 0, len(rows))
	for _, row := range rows {
		membershipIDs = append(membershipIDs, row.MembershipID.String())
	}
	roleMap, err := s.listMembershipRoles(ctx, membershipIDs)
	if err != nil {
		return nil, err
	}

	records := make([]WorkspaceMemberRecord, 0, len(rows))
	for _, row := range rows {
		records = append(records, WorkspaceMemberRecord{
			MembershipID: row.MembershipID.String(),
			Status:       row.Status,
			User: APIUser{
				ID:        row.UserID.String(),
				Email:     row.Email,
				FullName:  row.FullName,
				Status:    row.UserStatus,
				CreatedAt: row.CreatedAt.Format(time.RFC3339),
			},
			Roles: roleMap[row.MembershipID.String()],
		})
	}
	return records, nil
}

func (s *Service) UpdateWorkspaceMember(ctx context.Context, principal *Principal, workspaceID, membershipID uuid.UUID, status string, roleCodes []string) (*WorkspaceMemberRecord, error) {
	_, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "workspace.members.manage")
	if err != nil {
		return nil, err
	}

	membership := &database.WorkspaceMembership{ID: membershipID}
	if err := s.db.NewSelect().Model(membership).Where("workspace_id = ?", workspaceID).WherePK().Scan(ctx); err != nil {
		return nil, ErrNotFound
	}
	currentRoles, err := s.listMembershipRoles(ctx, []string{membership.ID.String()})
	if err != nil {
		return nil, err
	}

	nextStatus := membership.Status
	if status != "" {
		nextStatus = status
	}
	nextRoleCodes := roleCodes
	if len(nextRoleCodes) == 0 {
		nextRoleCodes = extractRoleCodes(currentRoles[membership.ID.String()])
	}
	if err := s.ensureWorkspaceHasOwner(ctx, workspaceID, membership.ID.String(), nextStatus, nextRoleCodes); err != nil {
		return nil, err
	}

	membership.Status = nextStatus
	membership.UpdatedAt = time.Now().UTC()
	if _, err := s.db.NewUpdate().Model(membership).Column("status", "updated_at").WherePK().Exec(ctx); err != nil {
		return nil, err
	}
	if len(roleCodes) > 0 {
		if err := s.assignWorkspaceRolesByCode(ctx, membership.ID, roleCodes); err != nil {
			return nil, err
		}
	}

	records, err := s.ListWorkspaceMembers(ctx, principal, workspaceID)
	if err != nil {
		return nil, err
	}
	for _, record := range records {
		if record.MembershipID == membershipID.String() {
			return &record, nil
		}
	}
	return nil, ErrNotFound
}

func (s *Service) ListWorkspaceRoles(ctx context.Context) ([]APIRole, error) {
	return s.listRolesByScope(ctx, "workspace")
}

func (s *Service) ListPlatformRoles(ctx context.Context, principal *Principal) ([]APIRole, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.users.view"); err != nil {
		return nil, err
	}
	return s.listRolesByScope(ctx, "platform")
}

func (s *Service) ListPlatformWorkspaceRoles(ctx context.Context, principal *Principal) ([]APIRole, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.workspaces.manage"); err != nil {
		return nil, err
	}
	return s.listRolesByScope(ctx, "workspace")
}

func (s *Service) ListWorkspaceInvites(ctx context.Context, principal *Principal, workspaceID uuid.UUID) ([]WorkspaceInviteRecord, error) {
	_, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "workspace.members.manage")
	if err != nil {
		return nil, err
	}
	var invites []database.WorkspaceInvite
	if err := s.db.NewSelect().Model(&invites).Where("workspace_id = ?", workspaceID).OrderExpr("created_at DESC").Scan(ctx); err != nil {
		return nil, err
	}
	roleMap, err := s.listInviteRoles(ctx, inviteIDStrings(invites))
	if err != nil {
		return nil, err
	}
	result := make([]WorkspaceInviteRecord, 0, len(invites))
	for _, invite := range invites {
		result = append(result, WorkspaceInviteRecord{
			ID:        invite.ID.String(),
			Email:     invite.Email,
			Status:    invite.Status,
			ExpiresAt: invite.ExpiresAt.Format(time.RFC3339),
			CreatedAt: invite.CreatedAt.Format(time.RFC3339),
			Roles:     roleMap[invite.ID.String()],
		})
	}
	return result, nil
}

func (s *Service) CreateWorkspaceInvite(ctx context.Context, principal *Principal, workspaceID uuid.UUID, email string, roleCodes []string) (*WorkspaceInviteRecord, string, error) {
	_, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "workspace.members.manage")
	if err != nil {
		return nil, "", err
	}
	email = normalizeEmail(email)
	if email == "" || len(roleCodes) == 0 {
		return nil, "", fmt.Errorf("%w: email and roles are required", ErrValidation)
	}

	token, tokenHash, err := auth.NewRefreshToken()
	if err != nil {
		return nil, "", err
	}
	invite := &database.WorkspaceInvite{
		ID:              uuid.New(),
		WorkspaceID:     workspaceID,
		Email:           email,
		TokenHash:       tokenHash,
		Status:          "pending",
		InvitedByUserID: &principal.UserID,
		ExpiresAt:       time.Now().UTC().Add(7 * 24 * time.Hour),
		CreatedAt:       time.Now().UTC(),
		UpdatedAt:       time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(invite).Exec(ctx); err != nil {
		return nil, "", err
	}
	if err := s.assignInviteRolesByCode(ctx, invite.ID, roleCodes); err != nil {
		return nil, "", err
	}
	records, err := s.ListWorkspaceInvites(ctx, principal, workspaceID)
	if err != nil {
		return nil, "", err
	}
	for _, record := range records {
		if record.ID == invite.ID.String() {
			return &record, token, nil
		}
	}
	return nil, "", ErrNotFound
}

func (s *Service) DeleteWorkspaceInvite(ctx context.Context, principal *Principal, workspaceID, inviteID uuid.UUID) error {
	_, err := s.requireWorkspaceAccess(ctx, principal, workspaceID, "workspace.members.manage")
	if err != nil {
		return err
	}
	_, err = s.db.NewDelete().Model((*database.WorkspaceInvite)(nil)).Where("id = ?", inviteID).Where("workspace_id = ?", workspaceID).Exec(ctx)
	return err
}

func (s *Service) AcceptInvite(ctx context.Context, principal *Principal, token string) (*WorkspaceMembershipSummary, error) {
	var invite database.WorkspaceInvite
	if err := s.db.NewSelect().Model(&invite).Where("token_hash = ?", auth.HashRefreshToken(token)).Limit(1).Scan(ctx); err != nil {
		return nil, ErrNotFound
	}
	if invite.Status != "pending" || invite.ExpiresAt.Before(time.Now().UTC()) {
		return nil, ErrConflict
	}
	user, err := s.findUserByID(ctx, principal.UserID)
	if err != nil {
		return nil, err
	}
	if normalizeEmail(user.Email) != normalizeEmail(invite.Email) {
		return nil, ErrForbidden
	}

	membership, err := s.findWorkspaceMembership(ctx, principal.UserID, invite.WorkspaceID)
	if err != nil && !errors.Is(err, ErrNotFound) {
		return nil, err
	}
	if membership == nil {
		membership = &database.WorkspaceMembership{
			ID:              uuid.New(),
			WorkspaceID:     invite.WorkspaceID,
			UserID:          principal.UserID,
			Status:          "active",
			InvitedByUserID: invite.InvitedByUserID,
			CreatedAt:       time.Now().UTC(),
			UpdatedAt:       time.Now().UTC(),
		}
		if _, err := s.db.NewInsert().Model(membership).Exec(ctx); err != nil {
			return nil, err
		}
	} else {
		membership.Status = "active"
		membership.UpdatedAt = time.Now().UTC()
		if _, err := s.db.NewUpdate().Model(membership).Column("status", "updated_at").WherePK().Exec(ctx); err != nil {
			return nil, err
		}
	}

	roleCodes, err := s.listInviteRoleCodes(ctx, invite.ID)
	if err != nil {
		return nil, err
	}
	if err := s.assignWorkspaceRolesByCode(ctx, membership.ID, roleCodes); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	if _, err := s.db.NewUpdate().Model((*database.WorkspaceInvite)(nil)).
		Set("status = ?", "accepted").
		Set("accepted_at = ?", now).
		Set("updated_at = ?", now).
		Where("id = ?", invite.ID).
		Exec(ctx); err != nil {
		return nil, err
	}

	workspace, err := s.findWorkspaceByID(ctx, invite.WorkspaceID)
	if err != nil {
		return nil, err
	}
	summary, err := s.membershipToSummary(ctx, *membership, *workspace)
	if err != nil {
		return nil, err
	}
	return &summary, nil
}

func (s *Service) ListPlatformUsers(ctx context.Context, principal *Principal) ([]PlatformUserRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.users.view"); err != nil {
		return nil, err
	}
	var users []database.User
	if err := s.db.NewSelect().Model(&users).OrderExpr("created_at DESC").Scan(ctx); err != nil {
		return nil, err
	}
	roleMap, err := s.listPlatformRolesByUser(ctx, userIDStrings(users))
	if err != nil {
		return nil, err
	}
	countMap, err := s.listWorkspaceCountsByUser(ctx, userIDStrings(users))
	if err != nil {
		return nil, err
	}
	result := make([]PlatformUserRecord, 0, len(users))
	for _, user := range users {
		platformRoles := roleMap[user.ID.String()]
		if platformRoles == nil {
			platformRoles = []APIRole{}
		}
		result = append(result, PlatformUserRecord{
			User:           apiUserFromModel(user),
			PlatformRoles:  platformRoles,
			WorkspaceCount: countMap[user.ID.String()],
		})
	}
	return result, nil
}

func (s *Service) GetPlatformUser(ctx context.Context, principal *Principal, userID uuid.UUID) (*PlatformUserRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.users.view"); err != nil {
		return nil, err
	}
	user, err := s.findUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return s.buildPlatformUserRecord(ctx, *user)
}

func (s *Service) CreatePlatformUser(ctx context.Context, principal *Principal, fullName, email, password, status string, roleCodes []string) (*PlatformUserRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.users.manage"); err != nil {
		return nil, err
	}
	fullName = strings.TrimSpace(fullName)
	email = normalizeEmail(email)
	password = strings.TrimSpace(password)
	status = strings.TrimSpace(status)
	if fullName == "" || email == "" || password == "" {
		return nil, fmt.Errorf("%w: full name, email, and password are required", ErrValidation)
	}
	if status == "" {
		status = "active"
	}
	if status != "active" && status != "suspended" {
		return nil, fmt.Errorf("%w: invalid status", ErrValidation)
	}
	if len(roleCodes) == 0 {
		return nil, fmt.Errorf("%w: at least one platform role is required", ErrValidation)
	}
	if _, err := s.findUserByEmail(ctx, email); err == nil {
		return nil, fmt.Errorf("%w: email already exists", ErrConflict)
	} else if !errors.Is(err, ErrNotFound) {
		return nil, err
	}

	passwordHash, err := auth.HashPassword(password)
	if err != nil {
		return nil, err
	}
	user := &database.User{
		ID:           uuid.New(),
		Email:        email,
		FullName:     fullName,
		PasswordHash: passwordHash,
		Status:       status,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(user).Exec(ctx); err != nil {
		return nil, err
	}
	if err := s.assignPlatformRolesByCode(ctx, user.ID, roleCodes); err != nil {
		return nil, err
	}
	return s.buildPlatformUserRecord(ctx, *user)
}

func (s *Service) UpdatePlatformUser(ctx context.Context, principal *Principal, userID uuid.UUID, fullName, status string, roleCodes []string) (*PlatformUserRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.users.manage"); err != nil {
		return nil, err
	}
	user, err := s.findUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	currentRoles, err := s.listPlatformRolesForUser(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	nextStatus := user.Status
	if status != "" {
		nextStatus = status
	}
	nextRoleCodes := extractRoleCodes(currentRoles)
	if len(roleCodes) > 0 {
		nextRoleCodes = roleCodes
	}
	if user.ID == principal.UserID {
		if nextStatus != user.Status || !sameStringSet(nextRoleCodes, extractRoleCodes(currentRoles)) {
			return nil, fmt.Errorf("%w: platform users cannot change their own status or role assignments", ErrConflict)
		}
	}
	if err := s.ensurePlatformHasActiveSuperAdmin(ctx, user.ID, nextStatus, nextRoleCodes); err != nil {
		return nil, err
	}
	if trimmedName := strings.TrimSpace(fullName); trimmedName != "" {
		user.FullName = trimmedName
	}
	user.Status = nextStatus
	user.UpdatedAt = time.Now().UTC()
	if _, err := s.db.NewUpdate().Model(user).Column("full_name", "status", "updated_at").WherePK().Exec(ctx); err != nil {
		return nil, err
	}
	if len(roleCodes) > 0 {
		if err := s.assignPlatformRolesByCode(ctx, user.ID, roleCodes); err != nil {
			return nil, err
		}
	}
	records, err := s.ListPlatformUsers(ctx, principal)
	if err != nil {
		return nil, err
	}
	for _, record := range records {
		if record.User.ID == userID.String() {
			return &record, nil
		}
	}
	return nil, ErrNotFound
}

func (s *Service) ListPlatformWorkspaces(ctx context.Context, principal *Principal) ([]PlatformWorkspaceRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.workspaces.view"); err != nil {
		return nil, err
	}
	var workspaces []database.Workspace
	if err := s.db.NewSelect().Model(&workspaces).OrderExpr("created_at DESC").Scan(ctx); err != nil {
		return nil, err
	}
	memberCounts, activeCounts, err := s.listWorkspaceCounts(ctx, workspaceIDStrings(workspaces))
	if err != nil {
		return nil, err
	}
	result := make([]PlatformWorkspaceRecord, 0, len(workspaces))
	for _, workspace := range workspaces {
		result = append(result, PlatformWorkspaceRecord{
			ID:                workspace.ID.String(),
			Name:              workspace.Name,
			Slug:              workspace.Slug,
			Status:            workspace.Status,
			MemberCount:       memberCounts[workspace.ID.String()],
			ActiveMemberCount: activeCounts[workspace.ID.String()],
		})
	}
	return result, nil
}

func (s *Service) GetPlatformWorkspace(ctx context.Context, principal *Principal, workspaceID uuid.UUID) (*PlatformWorkspaceRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.workspaces.view"); err != nil {
		return nil, err
	}
	workspace, err := s.findWorkspaceByID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	return s.buildPlatformWorkspaceRecord(ctx, *workspace)
}

func (s *Service) CreatePlatformWorkspace(ctx context.Context, principal *Principal, name string) (*PlatformWorkspaceRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.workspaces.manage"); err != nil {
		return nil, err
	}
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, fmt.Errorf("%w: name is required", ErrValidation)
	}
	slug, err := s.ensureWorkspaceSlug(ctx, name, uuid.Nil)
	if err != nil {
		return nil, err
	}
	workspace := &database.Workspace{
		ID:        uuid.New(),
		Name:      name,
		Slug:      slug,
		Status:    "active",
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(workspace).Exec(ctx); err != nil {
		return nil, err
	}
	records, err := s.ListPlatformWorkspaces(ctx, principal)
	if err != nil {
		return nil, err
	}
	for _, record := range records {
		if record.ID == workspace.ID.String() {
			return &record, nil
		}
	}
	return nil, ErrNotFound
}

func (s *Service) UpdatePlatformWorkspace(ctx context.Context, principal *Principal, workspaceID uuid.UUID, name, status string) (*PlatformWorkspaceRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.workspaces.manage"); err != nil {
		return nil, err
	}
	workspace, err := s.findWorkspaceByID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(name) != "" {
		workspace.Name = strings.TrimSpace(name)
		workspace.Slug, err = s.ensureWorkspaceSlug(ctx, workspace.Name, workspace.ID)
		if err != nil {
			return nil, err
		}
	}
	if status != "" {
		workspace.Status = status
	}
	workspace.UpdatedAt = time.Now().UTC()
	if _, err := s.db.NewUpdate().Model(workspace).Column("name", "slug", "status", "updated_at").WherePK().Exec(ctx); err != nil {
		return nil, err
	}
	records, err := s.ListPlatformWorkspaces(ctx, principal)
	if err != nil {
		return nil, err
	}
	for _, record := range records {
		if record.ID == workspace.ID.String() {
			return &record, nil
		}
	}
	return nil, ErrNotFound
}

func (s *Service) ListPlatformWorkspaceMembers(ctx context.Context, principal *Principal, workspaceID uuid.UUID) ([]WorkspaceMemberRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.workspaces.view"); err != nil {
		return nil, err
	}
	return s.ListWorkspaceMembers(ctx, &Principal{
		UserID:             principal.UserID,
		Portal:             auth.PortalCustomer,
		SessionID:          principal.SessionID,
		AssumedWorkspaceID: &workspaceID,
	}, workspaceID)
}

func (s *Service) CreatePlatformWorkspaceMember(ctx context.Context, principal *Principal, workspaceID uuid.UUID, fullName, email, password, status string, roleCodes []string) (*WorkspaceMemberRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.workspaces.manage"); err != nil {
		return nil, err
	}
	if _, err := s.findWorkspaceByID(ctx, workspaceID); err != nil {
		return nil, err
	}

	email = normalizeEmail(email)
	fullName = strings.TrimSpace(fullName)
	password = strings.TrimSpace(password)
	status = strings.TrimSpace(status)
	if email == "" {
		return nil, fmt.Errorf("%w: email is required", ErrValidation)
	}
	if status == "" {
		status = "active"
	}
	if status != "active" && status != "suspended" {
		return nil, fmt.Errorf("%w: invalid status", ErrValidation)
	}
	if len(roleCodes) == 0 {
		return nil, fmt.Errorf("%w: at least one workspace role is required", ErrValidation)
	}

	user, err := s.findUserByEmail(ctx, email)
	if err != nil {
		if !errors.Is(err, ErrNotFound) {
			return nil, err
		}
		if fullName == "" || password == "" {
			return nil, fmt.Errorf("%w: full name and password are required for new users", ErrValidation)
		}
		passwordHash, hashErr := auth.HashPassword(password)
		if hashErr != nil {
			return nil, hashErr
		}
		user = &database.User{
			ID:           uuid.New(),
			Email:        email,
			FullName:     fullName,
			PasswordHash: passwordHash,
			Status:       "active",
			CreatedAt:    time.Now().UTC(),
			UpdatedAt:    time.Now().UTC(),
		}
		if _, err := s.db.NewInsert().Model(user).Exec(ctx); err != nil {
			return nil, err
		}
	}

	existingMembership, err := s.findWorkspaceMembership(ctx, user.ID, workspaceID)
	if err == nil && existingMembership != nil {
		return nil, fmt.Errorf("%w: user is already associated with this workspace", ErrConflict)
	}
	if err != nil && !errors.Is(err, ErrNotFound) {
		return nil, err
	}

	membership := &database.WorkspaceMembership{
		ID:          uuid.New(),
		WorkspaceID: workspaceID,
		UserID:      user.ID,
		Status:      status,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(membership).Exec(ctx); err != nil {
		return nil, err
	}
	if err := s.assignWorkspaceRolesByCode(ctx, membership.ID, roleCodes); err != nil {
		return nil, err
	}
	return s.buildWorkspaceMemberRecord(ctx, *membership, *user)
}

func (s *Service) UpdatePlatformWorkspaceMember(ctx context.Context, principal *Principal, workspaceID, membershipID uuid.UUID, status string, roleCodes []string) (*WorkspaceMemberRecord, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.workspaces.manage"); err != nil {
		return nil, err
	}
	return s.UpdateWorkspaceMember(ctx, &Principal{
		UserID:             principal.UserID,
		Portal:             auth.PortalCustomer,
		SessionID:          principal.SessionID,
		AssumedWorkspaceID: &workspaceID,
	}, workspaceID, membershipID, status, roleCodes)
}

func (s *Service) AssumeWorkspace(ctx context.Context, principal *Principal, workspaceID uuid.UUID) (*AuthSessionResponse, string, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.support.assume_workspace"); err != nil {
		return nil, "", err
	}
	if _, err := s.findWorkspaceByID(ctx, workspaceID); err != nil {
		return nil, "", err
	}
	if err := s.insertAuditLog(ctx, &principal.UserID, "platform.support.assume_workspace", "workspace", workspaceID.String(), &workspaceID, map[string]any{
		"portal": auth.PortalPlatform,
	}); err != nil {
		return nil, "", err
	}
	user, err := s.findUserByID(ctx, principal.UserID)
	if err != nil {
		return nil, "", err
	}
	return s.createSessionResponse(ctx, user, auth.PortalCustomer, &workspaceID, nil)
}

func (s *Service) StartPlatformCustomerAccess(ctx context.Context, principal *Principal) (*AuthSessionResponse, string, error) {
	if principal.Portal != auth.PortalPlatform {
		return nil, "", ErrForbidden
	}
	user, err := s.findUserByID(ctx, principal.UserID)
	if err != nil {
		return nil, "", err
	}
	if err := s.insertAuditLog(ctx, &principal.UserID, "platform.customer_access.start", "user", user.ID.String(), nil, map[string]any{
		"portal": auth.PortalPlatform,
	}); err != nil {
		return nil, "", err
	}
	return s.createSessionResponse(ctx, user, auth.PortalCustomer, nil, nil)
}

func (s *Service) ImpersonateUser(ctx context.Context, principal *Principal, targetUserID uuid.UUID) (*AuthSessionResponse, string, error) {
	if _, err := s.requirePlatformAccess(ctx, principal, "platform.support.assume_user"); err != nil {
		return nil, "", err
	}
	if targetUserID == principal.UserID {
		return s.StartPlatformCustomerAccess(ctx, principal)
	}
	user, err := s.findUserByID(ctx, targetUserID)
	if err != nil {
		return nil, "", err
	}
	if user.Status != "active" {
		return nil, "", fmt.Errorf("%w: target user must be active", ErrConflict)
	}
	if err := s.insertAuditLog(ctx, &principal.UserID, "platform.support.assume_user", "user", user.ID.String(), nil, map[string]any{
		"portal": auth.PortalPlatform,
	}); err != nil {
		return nil, "", err
	}
	return s.createSessionResponse(ctx, user, auth.PortalCustomer, nil, &principal.UserID)
}

func (s *Service) createWorkspaceMembership(ctx context.Context, userID uuid.UUID, workspaceName string, invitedBy *uuid.UUID) (*database.Workspace, *database.WorkspaceMembership, error) {
	workspaceName = strings.TrimSpace(workspaceName)
	if workspaceName == "" {
		return nil, nil, fmt.Errorf("%w: workspace name is required", ErrValidation)
	}
	slug, err := s.ensureWorkspaceSlug(ctx, workspaceName, uuid.Nil)
	if err != nil {
		return nil, nil, err
	}
	workspace := &database.Workspace{
		ID:        uuid.New(),
		Name:      workspaceName,
		Slug:      slug,
		Status:    "active",
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(workspace).Exec(ctx); err != nil {
		return nil, nil, err
	}
	membership := &database.WorkspaceMembership{
		ID:              uuid.New(),
		WorkspaceID:     workspace.ID,
		UserID:          userID,
		Status:          "active",
		InvitedByUserID: invitedBy,
		CreatedAt:       time.Now().UTC(),
		UpdatedAt:       time.Now().UTC(),
	}
	if _, err := s.db.NewInsert().Model(membership).Exec(ctx); err != nil {
		return nil, nil, err
	}
	return workspace, membership, nil
}

func (s *Service) buildPlatformUserRecord(ctx context.Context, user database.User) (*PlatformUserRecord, error) {
	roleMap, err := s.listPlatformRolesByUser(ctx, []string{user.ID.String()})
	if err != nil {
		return nil, err
	}
	countMap, err := s.listWorkspaceCountsByUser(ctx, []string{user.ID.String()})
	if err != nil {
		return nil, err
	}
	memberships, err := s.listWorkspaceMembershipSummaries(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	platformRoles := roleMap[user.ID.String()]
	if platformRoles == nil {
		platformRoles = []APIRole{}
	}
	return &PlatformUserRecord{
		User:                 apiUserFromModel(user),
		PlatformRoles:        platformRoles,
		WorkspaceCount:       countMap[user.ID.String()],
		WorkspaceMemberships: memberships,
	}, nil
}

func (s *Service) buildPlatformWorkspaceRecord(ctx context.Context, workspace database.Workspace) (*PlatformWorkspaceRecord, error) {
	memberCounts, activeCounts, err := s.listWorkspaceCounts(ctx, []string{workspace.ID.String()})
	if err != nil {
		return nil, err
	}
	return &PlatformWorkspaceRecord{
		ID:                workspace.ID.String(),
		Name:              workspace.Name,
		Slug:              workspace.Slug,
		Status:            workspace.Status,
		MemberCount:       memberCounts[workspace.ID.String()],
		ActiveMemberCount: activeCounts[workspace.ID.String()],
	}, nil
}

func (s *Service) buildWorkspaceMemberRecord(ctx context.Context, membership database.WorkspaceMembership, user database.User) (*WorkspaceMemberRecord, error) {
	roleMap, err := s.listMembershipRoles(ctx, []string{membership.ID.String()})
	if err != nil {
		return nil, err
	}
	return &WorkspaceMemberRecord{
		MembershipID: membership.ID.String(),
		User:         apiUserFromModel(user),
		Status:       membership.Status,
		Roles:        roleMap[membership.ID.String()],
	}, nil
}

func (s *Service) ensureWorkspaceSlug(ctx context.Context, name string, workspaceID uuid.UUID) (string, error) {
	base := slugify(name)
	if base == "" {
		base = "workspace"
	}
	slug := base
	index := 1
	for {
		query := s.db.NewSelect().Model((*database.Workspace)(nil)).Where("slug = ?", slug)
		if workspaceID != uuid.Nil {
			query = query.Where("id != ?", workspaceID)
		}
		count, err := query.Count(ctx)
		if err != nil {
			return "", err
		}
		if count == 0 {
			return slug, nil
		}
		index++
		slug = fmt.Sprintf("%s-%d", base, index)
	}
}

func (s *Service) assignWorkspaceRolesByCode(ctx context.Context, membershipID uuid.UUID, roleCodes []string) error {
	roles, err := s.fetchRolesByCode(ctx, roleCodes, "workspace")
	if err != nil {
		return err
	}
	if _, err := s.db.NewDelete().Model((*database.WorkspaceMembershipRole)(nil)).Where("membership_id = ?", membershipID).Exec(ctx); err != nil {
		return err
	}
	for _, role := range roles {
		link := &database.WorkspaceMembershipRole{MembershipID: membershipID, RoleID: role.ID}
		if _, err := s.db.NewInsert().Model(link).Exec(ctx); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) assignPlatformRolesByCode(ctx context.Context, userID uuid.UUID, roleCodes []string) error {
	roles, err := s.fetchRolesByCode(ctx, roleCodes, "platform")
	if err != nil {
		return err
	}
	if _, err := s.db.NewDelete().Model((*database.PlatformUserRole)(nil)).Where("user_id = ?", userID).Exec(ctx); err != nil {
		return err
	}
	for _, role := range roles {
		link := &database.PlatformUserRole{UserID: userID, RoleID: role.ID}
		if _, err := s.db.NewInsert().Model(link).Exec(ctx); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) assignInviteRolesByCode(ctx context.Context, inviteID uuid.UUID, roleCodes []string) error {
	roles, err := s.fetchRolesByCode(ctx, roleCodes, "workspace")
	if err != nil {
		return err
	}
	for _, role := range roles {
		link := &database.WorkspaceInviteRole{InviteID: inviteID, RoleID: role.ID}
		if _, err := s.db.NewInsert().Model(link).Exec(ctx); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) fetchRolesByCode(ctx context.Context, roleCodes []string, scope string) ([]database.Role, error) {
	codes := uniqueStrings(roleCodes)
	if len(codes) == 0 {
		return nil, fmt.Errorf("%w: at least one role is required", ErrValidation)
	}
	var roles []database.Role
	if err := s.db.NewSelect().
		Model(&roles).
		Where("scope = ?", scope).
		Where("code IN (?)", bun.In(codes)).
		Scan(ctx); err != nil {
		return nil, err
	}
	if len(roles) != len(codes) {
		return nil, fmt.Errorf("%w: one or more roles are invalid", ErrValidation)
	}
	return roles, nil
}

func (s *Service) requireWorkspaceAccess(ctx context.Context, principal *Principal, workspaceID uuid.UUID, requiredPermission string) ([]APIPermission, error) {
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
	if !slices.ContainsFunc(permissions, func(item APIPermission) bool { return item.Code == requiredPermission }) {
		return nil, ErrForbidden
	}
	return permissions, nil
}

func (s *Service) requirePlatformAccess(ctx context.Context, principal *Principal, requiredPermission string) ([]APIPermission, error) {
	user, err := s.findUserByID(ctx, principal.UserID)
	if err != nil {
		return nil, err
	}
	if user.Status != "active" {
		return nil, ErrForbidden
	}
	permissions, err := s.listPlatformPermissionsForUser(ctx, principal.UserID)
	if err != nil {
		return nil, err
	}
	if !slices.ContainsFunc(permissions, func(item APIPermission) bool { return item.Code == requiredPermission }) {
		return nil, ErrForbidden
	}
	return permissions, nil
}

func (s *Service) findWorkspaceMembership(ctx context.Context, userID, workspaceID uuid.UUID) (*database.WorkspaceMembership, error) {
	var membership database.WorkspaceMembership
	if err := s.db.NewSelect().
		Model(&membership).
		Where("user_id = ?", userID).
		Where("workspace_id = ?", workspaceID).
		Limit(1).
		Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &membership, nil
}

func (s *Service) membershipToSummary(ctx context.Context, membership database.WorkspaceMembership, workspace database.Workspace) (WorkspaceMembershipSummary, error) {
	roleMap, err := s.listMembershipRoles(ctx, []string{membership.ID.String()})
	if err != nil {
		return WorkspaceMembershipSummary{}, err
	}
	return WorkspaceMembershipSummary{
		ID:              membership.ID.String(),
		WorkspaceID:     workspace.ID.String(),
		WorkspaceName:   workspace.Name,
		WorkspaceSlug:   workspace.Slug,
		WorkspaceStatus: workspace.Status,
		Status:          membership.Status,
		Roles:           roleMap[membership.ID.String()],
	}, nil
}

func (s *Service) ensureWorkspaceHasOwner(ctx context.Context, workspaceID uuid.UUID, membershipID, nextStatus string, nextRoleCodes []string) error {
	if slices.Contains(nextRoleCodes, "workspace_owner") && nextStatus == "active" {
		return nil
	}
	type row struct {
		MembershipID string `bun:"membership_id"`
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("workspace_membership_roles AS wmr").
		ColumnExpr("wmr.membership_id::text AS membership_id").
		Join("JOIN workspace_memberships AS wm ON wm.id = wmr.membership_id").
		Join("JOIN roles AS r ON r.id = wmr.role_id").
		Where("wm.workspace_id = ?", workspaceID).
		Where("wm.status = ?", "active").
		Where("r.code = ?", "workspace_owner").
		Scan(ctx, &rows); err != nil {
		return err
	}
	ownerCount := 0
	for _, row := range rows {
		if row.MembershipID != membershipID {
			ownerCount++
		}
	}
	if ownerCount == 0 {
		return ErrLastWorkspaceOwner
	}
	return nil
}

func (s *Service) ensurePlatformHasActiveSuperAdmin(ctx context.Context, userID uuid.UUID, nextStatus string, nextRoleCodes []string) error {
	if nextStatus == "active" && slices.Contains(nextRoleCodes, "super_admin") {
		return nil
	}

	type row struct {
		UserID string `bun:"user_id"`
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("platform_user_roles AS pur").
		ColumnExpr("pur.user_id::text AS user_id").
		Join("JOIN roles AS r ON r.id = pur.role_id").
		Join("JOIN users AS u ON u.id = pur.user_id").
		Where("r.code = ?", "super_admin").
		Where("u.status = ?", "active").
		Scan(ctx, &rows); err != nil {
		return err
	}

	activeSuperAdminCount := 0
	for _, row := range rows {
		if row.UserID != userID.String() {
			activeSuperAdminCount++
		}
	}
	if activeSuperAdminCount == 0 {
		return fmt.Errorf("%w: platform must retain at least one active super admin", ErrConflict)
	}
	return nil
}

func (s *Service) insertAuditLog(ctx context.Context, actorUserID *uuid.UUID, action, targetType, targetID string, workspaceID *uuid.UUID, metadata map[string]any) error {
	payload, err := json.Marshal(metadata)
	if err != nil {
		return err
	}
	log := &database.AuditLog{
		ID:          uuid.New(),
		ActorUserID: actorUserID,
		Action:      action,
		TargetType:  targetType,
		TargetID:    targetID,
		WorkspaceID: workspaceID,
		Metadata:    string(payload),
		CreatedAt:   time.Now().UTC(),
	}
	_, err = s.db.NewInsert().Model(log).Exec(ctx)
	return err
}

func (s *Service) listWorkspacePermissionsForUser(ctx context.Context, userID, workspaceID uuid.UUID, assumedWorkspaceID *uuid.UUID) ([]APIPermission, error) {
	if assumedWorkspaceID != nil && *assumedWorkspaceID == workspaceID {
		return s.listPermissionsByScope(ctx, "workspace")
	}

	type row struct {
		Code        string `bun:"code"`
		Label       string `bun:"label"`
		Scope       string `bun:"scope"`
		Description string `bun:"description"`
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("workspace_memberships AS wm").
		ColumnExpr("DISTINCT p.code, p.label, p.scope, p.description").
		Join("JOIN workspace_membership_roles AS wmr ON wmr.membership_id = wm.id").
		Join("JOIN role_permissions AS rp ON rp.role_id = wmr.role_id").
		Join("JOIN permissions AS p ON p.id = rp.permission_id").
		Where("wm.user_id = ?", userID).
		Where("wm.workspace_id = ?", workspaceID).
		Where("wm.status = ?", "active").
		OrderExpr("p.code ASC").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		if _, err := s.findWorkspaceMembership(ctx, userID, workspaceID); err != nil {
			return nil, ErrForbidden
		}
	}
	result := make([]APIPermission, 0, len(rows))
	for _, row := range rows {
		result = append(result, APIPermission{
			Code:        row.Code,
			Label:       row.Label,
			Scope:       row.Scope,
			Description: row.Description,
		})
	}
	return result, nil
}

func (s *Service) listPlatformPermissionsForUser(ctx context.Context, userID uuid.UUID) ([]APIPermission, error) {
	type row struct {
		Code        string `bun:"code"`
		Label       string `bun:"label"`
		Scope       string `bun:"scope"`
		Description string `bun:"description"`
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("platform_user_roles AS pur").
		ColumnExpr("DISTINCT p.code, p.label, p.scope, p.description").
		Join("JOIN role_permissions AS rp ON rp.role_id = pur.role_id").
		Join("JOIN permissions AS p ON p.id = rp.permission_id").
		Where("pur.user_id = ?", userID).
		OrderExpr("p.code ASC").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	result := make([]APIPermission, 0, len(rows))
	for _, row := range rows {
		result = append(result, APIPermission{
			Code:        row.Code,
			Label:       row.Label,
			Scope:       row.Scope,
			Description: row.Description,
		})
	}
	return result, nil
}

func (s *Service) listPermissionsByScope(ctx context.Context, scope string) ([]APIPermission, error) {
	var permissions []database.Permission
	if err := s.db.NewSelect().Model(&permissions).Where("scope = ?", scope).OrderExpr("code ASC").Scan(ctx); err != nil {
		return nil, err
	}
	result := make([]APIPermission, 0, len(permissions))
	for _, permission := range permissions {
		result = append(result, APIPermission{
			Code:        permission.Code,
			Label:       permission.Label,
			Scope:       permission.Scope,
			Description: permission.Description,
		})
	}
	return result, nil
}

func (s *Service) listPlatformRolesForUser(ctx context.Context, userID uuid.UUID) ([]APIRole, error) {
	roleMap, err := s.listPlatformRolesByUser(ctx, []string{userID.String()})
	if err != nil {
		return nil, err
	}
	return roleMap[userID.String()], nil
}

func (s *Service) listWorkspaceMembershipSummaries(ctx context.Context, userID uuid.UUID) ([]WorkspaceMembershipSummary, error) {
	type row struct {
		MembershipID    uuid.UUID `bun:"membership_id"`
		WorkspaceID     uuid.UUID `bun:"workspace_id"`
		WorkspaceName   string    `bun:"workspace_name"`
		WorkspaceSlug   string    `bun:"workspace_slug"`
		WorkspaceStatus string    `bun:"workspace_status"`
		Status          string    `bun:"membership_status"`
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("workspace_memberships AS wm").
		ColumnExpr("wm.id AS membership_id").
		ColumnExpr("wm.workspace_id AS workspace_id").
		ColumnExpr("w.name AS workspace_name").
		ColumnExpr("w.slug AS workspace_slug").
		ColumnExpr("w.status AS workspace_status").
		ColumnExpr("wm.status AS membership_status").
		Join("JOIN workspaces AS w ON w.id = wm.workspace_id").
		Where("wm.user_id = ?", userID).
		OrderExpr("w.created_at ASC").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	membershipIDs := make([]string, 0, len(rows))
	for _, row := range rows {
		membershipIDs = append(membershipIDs, row.MembershipID.String())
	}
	roleMap, err := s.listMembershipRoles(ctx, membershipIDs)
	if err != nil {
		return nil, err
	}
	result := make([]WorkspaceMembershipSummary, 0, len(rows))
	for _, row := range rows {
		result = append(result, WorkspaceMembershipSummary{
			ID:              row.MembershipID.String(),
			WorkspaceID:     row.WorkspaceID.String(),
			WorkspaceName:   row.WorkspaceName,
			WorkspaceSlug:   row.WorkspaceSlug,
			WorkspaceStatus: row.WorkspaceStatus,
			Status:          row.Status,
			Roles:           roleMap[row.MembershipID.String()],
		})
	}
	return result, nil
}

func (s *Service) listRolesByScope(ctx context.Context, scope string) ([]APIRole, error) {
	var roles []database.Role
	if err := s.db.NewSelect().Model(&roles).Where("scope = ?", scope).OrderExpr("label ASC").Scan(ctx); err != nil {
		return nil, err
	}
	permissionMap, err := s.listPermissionsByRoleID(ctx, roleIDStrings(roles))
	if err != nil {
		return nil, err
	}
	result := make([]APIRole, 0, len(roles))
	for _, role := range roles {
		result = append(result, APIRole{
			ID:          role.ID.String(),
			Code:        role.Code,
			Label:       role.Label,
			Scope:       role.Scope,
			Permissions: permissionMap[role.ID.String()],
		})
	}
	return result, nil
}

func (s *Service) listPermissionsByRoleID(ctx context.Context, roleIDs []string) (map[string][]APIPermission, error) {
	type row struct {
		RoleID      string `bun:"role_id"`
		Code        string `bun:"code"`
		Label       string `bun:"label"`
		Scope       string `bun:"scope"`
		Description string `bun:"description"`
	}
	result := map[string][]APIPermission{}
	if len(roleIDs) == 0 {
		return result, nil
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("role_permissions AS rp").
		ColumnExpr("rp.role_id::text AS role_id").
		ColumnExpr("p.code, p.label, p.scope, p.description").
		Join("JOIN permissions AS p ON p.id = rp.permission_id").
		Where("rp.role_id IN (?)", bun.In(roleIDs)).
		OrderExpr("p.code ASC").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	for _, row := range rows {
		result[row.RoleID] = append(result[row.RoleID], APIPermission{
			Code:        row.Code,
			Label:       row.Label,
			Scope:       row.Scope,
			Description: row.Description,
		})
	}
	return result, nil
}

func (s *Service) listMembershipRoles(ctx context.Context, membershipIDs []string) (map[string][]APIRole, error) {
	type row struct {
		MembershipID string `bun:"membership_id"`
		RoleID       string `bun:"role_id"`
		Code         string `bun:"code"`
		Label        string `bun:"label"`
		Scope        string `bun:"scope"`
	}
	result := map[string][]APIRole{}
	if len(membershipIDs) == 0 {
		return result, nil
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("workspace_membership_roles AS wmr").
		ColumnExpr("wmr.membership_id::text AS membership_id").
		ColumnExpr("r.id::text AS role_id").
		ColumnExpr("r.code, r.label, r.scope").
		Join("JOIN roles AS r ON r.id = wmr.role_id").
		Where("wmr.membership_id IN (?)", bun.In(membershipIDs)).
		OrderExpr("r.label ASC").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	roleIDs := make([]string, 0, len(rows))
	for _, row := range rows {
		roleIDs = append(roleIDs, row.RoleID)
	}
	permissionMap, err := s.listPermissionsByRoleID(ctx, uniqueStrings(roleIDs))
	if err != nil {
		return nil, err
	}
	for _, row := range rows {
		result[row.MembershipID] = append(result[row.MembershipID], APIRole{
			ID:          row.RoleID,
			Code:        row.Code,
			Label:       row.Label,
			Scope:       row.Scope,
			Permissions: permissionMap[row.RoleID],
		})
	}
	return result, nil
}

func (s *Service) listPlatformRolesByUser(ctx context.Context, userIDs []string) (map[string][]APIRole, error) {
	type row struct {
		UserID string `bun:"user_id"`
		RoleID string `bun:"role_id"`
		Code   string `bun:"code"`
		Label  string `bun:"label"`
		Scope  string `bun:"scope"`
	}
	result := map[string][]APIRole{}
	if len(userIDs) == 0 {
		return result, nil
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("platform_user_roles AS pur").
		ColumnExpr("pur.user_id::text AS user_id").
		ColumnExpr("r.id::text AS role_id").
		ColumnExpr("r.code, r.label, r.scope").
		Join("JOIN roles AS r ON r.id = pur.role_id").
		Where("pur.user_id IN (?)", bun.In(userIDs)).
		OrderExpr("r.label ASC").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	roleIDs := make([]string, 0, len(rows))
	for _, row := range rows {
		roleIDs = append(roleIDs, row.RoleID)
	}
	permissionMap, err := s.listPermissionsByRoleID(ctx, uniqueStrings(roleIDs))
	if err != nil {
		return nil, err
	}
	for _, row := range rows {
		result[row.UserID] = append(result[row.UserID], APIRole{
			ID:          row.RoleID,
			Code:        row.Code,
			Label:       row.Label,
			Scope:       row.Scope,
			Permissions: permissionMap[row.RoleID],
		})
	}
	return result, nil
}

func (s *Service) listInviteRoles(ctx context.Context, inviteIDs []string) (map[string][]APIRole, error) {
	type row struct {
		InviteID string `bun:"invite_id"`
		RoleID   string `bun:"role_id"`
		Code     string `bun:"code"`
		Label    string `bun:"label"`
		Scope    string `bun:"scope"`
	}
	result := map[string][]APIRole{}
	if len(inviteIDs) == 0 {
		return result, nil
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("workspace_invite_roles AS wir").
		ColumnExpr("wir.invite_id::text AS invite_id").
		ColumnExpr("r.id::text AS role_id").
		ColumnExpr("r.code, r.label, r.scope").
		Join("JOIN roles AS r ON r.id = wir.role_id").
		Where("wir.invite_id IN (?)", bun.In(inviteIDs)).
		OrderExpr("r.label ASC").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	roleIDs := make([]string, 0, len(rows))
	for _, row := range rows {
		roleIDs = append(roleIDs, row.RoleID)
	}
	permissionMap, err := s.listPermissionsByRoleID(ctx, uniqueStrings(roleIDs))
	if err != nil {
		return nil, err
	}
	for _, row := range rows {
		result[row.InviteID] = append(result[row.InviteID], APIRole{
			ID:          row.RoleID,
			Code:        row.Code,
			Label:       row.Label,
			Scope:       row.Scope,
			Permissions: permissionMap[row.RoleID],
		})
	}
	return result, nil
}

func (s *Service) listInviteRoleCodes(ctx context.Context, inviteID uuid.UUID) ([]string, error) {
	type row struct {
		Code string `bun:"code"`
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("workspace_invite_roles AS wir").
		ColumnExpr("r.code").
		Join("JOIN roles AS r ON r.id = wir.role_id").
		Where("wir.invite_id = ?", inviteID).
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	result := make([]string, 0, len(rows))
	for _, row := range rows {
		result = append(result, row.Code)
	}
	return result, nil
}

func (s *Service) listWorkspaceCountsByUser(ctx context.Context, userIDs []string) (map[string]int, error) {
	type row struct {
		UserID string `bun:"user_id"`
		Count  int    `bun:"count"`
	}
	result := map[string]int{}
	if len(userIDs) == 0 {
		return result, nil
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("workspace_memberships AS wm").
		ColumnExpr("wm.user_id::text AS user_id").
		ColumnExpr("COUNT(*)::int AS count").
		Where("wm.user_id IN (?)", bun.In(userIDs)).
		GroupExpr("wm.user_id").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	for _, row := range rows {
		result[row.UserID] = row.Count
	}
	return result, nil
}

func (s *Service) listWorkspaceCounts(ctx context.Context, workspaceIDs []string) (map[string]int, map[string]int, error) {
	type row struct {
		WorkspaceID string `bun:"workspace_id"`
		Count       int    `bun:"count"`
	}
	counts := map[string]int{}
	activeCounts := map[string]int{}
	if len(workspaceIDs) == 0 {
		return counts, activeCounts, nil
	}
	var rows []row
	if err := s.db.NewSelect().
		TableExpr("workspace_memberships AS wm").
		ColumnExpr("wm.workspace_id::text AS workspace_id").
		ColumnExpr("COUNT(*)::int AS count").
		Where("wm.workspace_id IN (?)", bun.In(workspaceIDs)).
		GroupExpr("wm.workspace_id").
		Scan(ctx, &rows); err != nil {
		return nil, nil, err
	}
	for _, row := range rows {
		counts[row.WorkspaceID] = row.Count
	}
	rows = nil
	if err := s.db.NewSelect().
		TableExpr("workspace_memberships AS wm").
		ColumnExpr("wm.workspace_id::text AS workspace_id").
		ColumnExpr("COUNT(*)::int AS count").
		Where("wm.workspace_id IN (?)", bun.In(workspaceIDs)).
		Where("wm.status = ?", "active").
		GroupExpr("wm.workspace_id").
		Scan(ctx, &rows); err != nil {
		return nil, nil, err
	}
	for _, row := range rows {
		activeCounts[row.WorkspaceID] = row.Count
	}
	return counts, activeCounts, nil
}

func permissionsFromRows(rows []struct {
	Code        string
	Label       string
	Scope       string
	Description string
}) []APIPermission {
	result := make([]APIPermission, 0, len(rows))
	for _, row := range rows {
		result = append(result, APIPermission{
			Code:        row.Code,
			Label:       row.Label,
			Scope:       row.Scope,
			Description: row.Description,
		})
	}
	return result
}

func membershipIDStrings(rows []struct {
	MembershipID uuid.UUID
	Status       string
	UserID       uuid.UUID
	Email        string
	FullName     string
	UserStatus   string
	CreatedAt    time.Time
}) []string {
	result := make([]string, 0, len(rows))
	for _, row := range rows {
		result = append(result, row.MembershipID.String())
	}
	return result
}

func membershipIDsFromMembershipSummaryRows(rows []struct {
	MembershipID    uuid.UUID
	WorkspaceID     uuid.UUID
	WorkspaceName   string
	WorkspaceSlug   string
	WorkspaceStatus string
	Status          string
}) []string {
	result := make([]string, 0, len(rows))
	for _, row := range rows {
		result = append(result, row.MembershipID.String())
	}
	return result
}

func roleIDsFromMembershipRows(rows []struct {
	MembershipID string
	RoleID       string
	Code         string
	Label        string
	Scope        string
}) []string {
	result := make([]string, 0, len(rows))
	for _, row := range rows {
		result = append(result, row.RoleID)
	}
	return uniqueStrings(result)
}

func roleIDsFromPlatformRows(rows []struct {
	UserID string
	RoleID string
	Code   string
	Label  string
	Scope  string
}) []string {
	result := make([]string, 0, len(rows))
	for _, row := range rows {
		result = append(result, row.RoleID)
	}
	return uniqueStrings(result)
}

func roleIDsFromInviteRows(rows []struct {
	InviteID string
	RoleID   string
	Code     string
	Label    string
	Scope    string
}) []string {
	result := make([]string, 0, len(rows))
	for _, row := range rows {
		result = append(result, row.RoleID)
	}
	return uniqueStrings(result)
}

func userIDStrings(users []database.User) []string {
	result := make([]string, 0, len(users))
	for _, user := range users {
		result = append(result, user.ID.String())
	}
	return result
}

func roleIDStrings(roles []database.Role) []string {
	result := make([]string, 0, len(roles))
	for _, role := range roles {
		result = append(result, role.ID.String())
	}
	return result
}

func workspaceIDStrings(workspaces []database.Workspace) []string {
	result := make([]string, 0, len(workspaces))
	for _, workspace := range workspaces {
		result = append(result, workspace.ID.String())
	}
	return result
}

func inviteIDStrings(invites []database.WorkspaceInvite) []string {
	result := make([]string, 0, len(invites))
	for _, invite := range invites {
		result = append(result, invite.ID.String())
	}
	return result
}

func extractRoleCodes(roles []APIRole) []string {
	result := make([]string, 0, len(roles))
	for _, role := range roles {
		result = append(result, role.Code)
	}
	return result
}

package auth

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestIssueAndParseAccessToken(t *testing.T) {
	userID := uuid.New()
	sessionID := uuid.New()
	workspaceID := uuid.New()

	token, err := IssueAccessToken("test-secret", userID, sessionID, PortalCustomer, time.Minute, &workspaceID, nil)
	if err != nil {
		t.Fatalf("IssueAccessToken returned error: %v", err)
	}

	claims, err := ParseAccessToken("test-secret", token)
	if err != nil {
		t.Fatalf("ParseAccessToken returned error: %v", err)
	}

	if claims.Subject != userID.String() {
		t.Fatalf("expected subject %s, got %s", userID, claims.Subject)
	}
	if claims.SessionID != sessionID.String() {
		t.Fatalf("expected session %s, got %s", sessionID, claims.SessionID)
	}
	if claims.AssumedWorkspaceID != workspaceID.String() {
		t.Fatalf("expected assumed workspace %s, got %s", workspaceID, claims.AssumedWorkspaceID)
	}
}

func TestRefreshTokenHashing(t *testing.T) {
	plain, hashed, err := NewRefreshToken()
	if err != nil {
		t.Fatalf("NewRefreshToken returned error: %v", err)
	}

	if plain == "" || hashed == "" {
		t.Fatal("expected non-empty refresh token values")
	}
	if HashRefreshToken(plain) != hashed {
		t.Fatal("expected refresh token hash to be reproducible")
	}
}

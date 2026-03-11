package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	PortalCustomer = "customer"
	PortalPlatform = "platform"
)

// Claims are the JWT access token claims.
type Claims struct {
	SessionID          string `json:"sid"`
	Portal             string `json:"portal"`
	AssumedWorkspaceID string `json:"assumed_workspace_id,omitempty"`
	ImpersonatorUserID string `json:"impersonator_user_id,omitempty"`
	jwt.RegisteredClaims
}

// IssueAccessToken creates a signed access token.
func IssueAccessToken(secret string, userID uuid.UUID, sessionID uuid.UUID, portal string, ttl time.Duration, assumedWorkspaceID *uuid.UUID, impersonatorUserID *uuid.UUID) (string, error) {
	now := time.Now().UTC()
	claims := Claims{
		SessionID: sessionID.String(),
		Portal:    portal,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	}
	if assumedWorkspaceID != nil {
		claims.AssumedWorkspaceID = assumedWorkspaceID.String()
	}
	if impersonatorUserID != nil {
		claims.ImpersonatorUserID = impersonatorUserID.String()
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ParseAccessToken validates and parses an access token.
func ParseAccessToken(secret, tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (any, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, jwt.ErrTokenInvalidClaims
	}
	return claims, nil
}

// NewRefreshToken creates a random refresh token and its stored hash.
func NewRefreshToken() (plain string, hashed string, err error) {
	raw := make([]byte, 32)
	if _, err = rand.Read(raw); err != nil {
		return "", "", err
	}
	plain = base64.RawURLEncoding.EncodeToString(raw)
	sum := sha256.Sum256([]byte(plain))
	hashed = hex.EncodeToString(sum[:])
	return plain, hashed, nil
}

// HashRefreshToken hashes an incoming refresh token for DB comparison.
func HashRefreshToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

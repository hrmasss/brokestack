package workerclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/brokestack/api/internal/config"
)

type Client struct {
	baseURL      string
	sharedSecret string
	httpClient   *http.Client
}

func New(cfg config.WorkerConfig) *Client {
	return &Client{
		baseURL:      strings.TrimRight(cfg.URL, "/"),
		sharedSecret: cfg.SharedSecret,
		httpClient: &http.Client{
			Timeout: cfg.Timeout,
		},
	}
}

type StartLoginSessionRequest struct {
	LoginSessionID    string `json:"loginSessionId"`
	ProviderAccountID string `json:"providerAccountId"`
	WorkspaceID       string `json:"workspaceId"`
	Provider          string `json:"provider"`
	ProfileKey        string `json:"profileKey"`
}

type StartLoginSessionResponse struct {
	WorkerSessionID    string `json:"workerSessionId"`
	BrowserInstanceID  string `json:"browserInstanceId"`
	Status             string `json:"status"`
	SessionStatus      string `json:"sessionStatus"`
	StreamSessionToken string `json:"streamSessionToken"`
	StreamURL          string `json:"streamUrl"`
	RuntimeType        string `json:"runtimeType"`
	ProfileMountPath   string `json:"profileMountPath"`
	Region             string `json:"region"`
	NodeName           string `json:"nodeName"`
}

type RefreshLoginSessionStreamRequest struct {
	WorkerSessionID string `json:"workerSessionId"`
}

type RefreshLoginSessionStreamResponse struct {
	StreamSessionToken string `json:"streamSessionToken"`
	StreamURL          string `json:"streamUrl"`
}

type StartAutomationRunRequest struct {
	RunID             string            `json:"runId"`
	AutomationID      string            `json:"automationId"`
	ProviderAccountID string            `json:"providerAccountId"`
	WorkspaceID       string            `json:"workspaceId"`
	Provider          string            `json:"provider"`
	ProfileKey        string            `json:"profileKey"`
	PromptText        string            `json:"promptText"`
	Config            map[string]any    `json:"config"`
	Metadata          map[string]string `json:"metadata,omitempty"`
}

type StartAutomationRunResponse struct {
	WorkerRunID string `json:"workerRunId"`
	Status      string `json:"status"`
}

func (c *Client) StartLoginSession(ctx context.Context, payload StartLoginSessionRequest) (*StartLoginSessionResponse, error) {
	response := &StartLoginSessionResponse{}
	if err := c.post(ctx, "/provider-accounts/login-sessions", payload, response); err != nil {
		return nil, err
	}
	return response, nil
}

func (c *Client) StartAutomationRun(ctx context.Context, payload StartAutomationRunRequest) (*StartAutomationRunResponse, error) {
	response := &StartAutomationRunResponse{}
	if err := c.post(ctx, "/automation-runs", payload, response); err != nil {
		return nil, err
	}
	return response, nil
}

func (c *Client) RefreshLoginSessionStream(ctx context.Context, workerSessionID string) (*RefreshLoginSessionStreamResponse, error) {
	response := &RefreshLoginSessionStreamResponse{}
	if err := c.post(ctx, fmt.Sprintf("/provider-accounts/login-sessions/%s/refresh-stream", workerSessionID), RefreshLoginSessionStreamRequest{
		WorkerSessionID: workerSessionID,
	}, response); err != nil {
		return nil, err
	}
	return response, nil
}

func (c *Client) post(ctx context.Context, path string, payload any, target any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.sharedSecret != "" {
		req.Header.Set("X-Worker-Secret", c.sharedSecret)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return fmt.Errorf("worker request failed: status %d", resp.StatusCode)
	}

	if target == nil {
		return nil
	}
	return json.NewDecoder(resp.Body).Decode(target)
}

func HealthTimeout() time.Duration {
	return 5 * time.Second
}

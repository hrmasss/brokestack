package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds all application configuration
type Config struct {
	Environment string
	API         APIConfig
	Database    DatabaseConfig
	Auth        AuthConfig
	Bootstrap   BootstrapConfig
	Worker      WorkerConfig
	Storage     StorageConfig
}

// APIConfig holds API server configuration
type APIConfig struct {
	Host   string
	Port   string
	Prefix string
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	URL            string
	MaxConnections int
	MaxIdleConns   int
}

// AuthConfig holds authentication settings.
type AuthConfig struct {
	JWTSecret          string
	AccessTokenTTL     time.Duration
	RefreshTokenTTL    time.Duration
	CustomerCookieName string
	PlatformCookieName string
	CookieSecure       bool
}

// BootstrapConfig holds first-admin bootstrap configuration.
type BootstrapConfig struct {
	AdminName     string
	AdminEmail    string
	AdminPassword string
}

// WorkerConfig holds worker integration settings.
type WorkerConfig struct {
	URL          string
	SharedSecret string
	Timeout      time.Duration
}

// StorageConfig holds local filesystem storage settings.
type StorageConfig struct {
	RootDir          string
	WorkerOutputsDir string
}

// Load reads configuration from environment variables
func Load() *Config {
	return &Config{
		Environment: getEnv("GO_ENV", "development"),
		API: APIConfig{
			Host:   getEnv("API_HOST", "localhost"),
			Port:   getEnv("API_PORT", "8080"),
			Prefix: getEnv("API_PREFIX", "/api/v1"),
		},
		Database: DatabaseConfig{
			URL:            getEnv("DATABASE_URL", "postgres://brokestack:brokestack@localhost:5432/brokestack?sslmode=disable"),
			MaxConnections: getEnvInt("DATABASE_MAX_CONNECTIONS", 25),
			MaxIdleConns:   getEnvInt("DATABASE_MAX_IDLE_CONNECTIONS", 5),
		},
		Auth: AuthConfig{
			JWTSecret:          getEnv("JWT_SECRET", "brokestack-local-dev-secret"),
			AccessTokenTTL:     getEnvDuration("JWT_ACCESS_TTL", 15*time.Minute),
			RefreshTokenTTL:    getEnvDuration("JWT_REFRESH_TTL", 30*24*time.Hour),
			CustomerCookieName: getEnv("AUTH_CUSTOMER_REFRESH_COOKIE", "brokestack_customer_refresh"),
			PlatformCookieName: getEnv("AUTH_PLATFORM_REFRESH_COOKIE", "brokestack_platform_refresh"),
			CookieSecure:       getEnvBool("AUTH_COOKIE_SECURE", false),
		},
		Bootstrap: BootstrapConfig{
			AdminName:     getEnv("BOOTSTRAP_ADMIN_NAME", "System Admin"),
			AdminEmail:    getEnv("BOOTSTRAP_ADMIN_EMAIL", ""),
			AdminPassword: getEnv("BOOTSTRAP_ADMIN_PASSWORD", ""),
		},
		Worker: WorkerConfig{
			URL:          getEnv("WORKER_URL", "http://127.0.0.1:8091"),
			SharedSecret: getEnv("WORKER_SHARED_SECRET", "brokestack-worker-local-secret"),
			Timeout:      getEnvDuration("WORKER_REQUEST_TIMEOUT", 30*time.Second),
		},
		Storage: StorageConfig{
			RootDir:          getEnv("STORAGE_ROOT_DIR", ".tmp/storage"),
			WorkerOutputsDir: getEnv("WORKER_OUTPUTS_DIR", "apps/worker/.tmp/storage/outputs"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		parsed, err := strconv.ParseBool(value)
		if err == nil {
			return parsed
		}
	}
	return defaultValue
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		parsed, err := time.ParseDuration(value)
		if err == nil {
			return parsed
		}
	}
	return defaultValue
}

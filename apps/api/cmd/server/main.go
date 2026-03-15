package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/joho/godotenv"

	"github.com/brokestack/api/internal/config"
	"github.com/brokestack/api/internal/database"
	"github.com/brokestack/api/internal/handlers"
	"github.com/brokestack/api/internal/iam"
)

const (
	commandServe      = "serve"
	commandMigrate    = "migrate"
	commandSeedSystem = "seed-system"
	commandHealth     = "healthcheck"
	commandBackupDB   = "backup-db"
	commandRestoreDB  = "restore-db"
)

func main() {
	rootDir := findRootDir()
	if err := loadEnv(rootDir); err != nil {
		log.Printf("No .env file found, using environment variables: %v", err)
	}
	if err := os.Chdir(rootDir); err != nil {
		log.Fatalf("switch to project root: %v", err)
	}

	command := resolveCommand(os.Args[1:])
	switch command {
	case commandServe:
		if err := runServe(); err != nil {
			log.Fatalf("serve failed: %v", err)
		}
	case commandMigrate:
		if err := runMigrate(rootDir); err != nil {
			log.Fatalf("migrate failed: %v", err)
		}
	case commandSeedSystem:
		if err := runSeedSystem(); err != nil {
			log.Fatalf("seed-system failed: %v", err)
		}
	case commandHealth:
		if err := runHealthcheck(); err != nil {
			log.Fatalf("healthcheck failed: %v", err)
		}
	case commandBackupDB:
		if err := runBackupDB(os.Args[2:]); err != nil {
			log.Fatalf("backup-db failed: %v", err)
		}
	case commandRestoreDB:
		if err := runRestoreDB(os.Args[2:]); err != nil {
			log.Fatalf("restore-db failed: %v", err)
		}
	default:
		log.Fatalf("unknown command %q", command)
	}
}

func resolveCommand(args []string) string {
	if len(args) == 0 {
		return commandServe
	}

	switch strings.TrimSpace(args[0]) {
	case "", commandServe:
		return commandServe
	case commandMigrate:
		return commandMigrate
	case commandSeedSystem:
		return commandSeedSystem
	case commandHealth:
		return commandHealth
	case commandBackupDB:
		return commandBackupDB
	case commandRestoreDB:
		return commandRestoreDB
	default:
		return args[0]
	}
}

func runServe() error {
	cfg := config.Load()
	service, cleanup, err := openService(cfg)
	if err != nil {
		return err
	}
	defer cleanup()

	app := fiber.New(fiber.Config{
		AppName:      "BrokeStack API v0.1.0",
		ServerHeader: "BrokeStack",
		ErrorHandler: func(c fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error":   true,
				"message": err.Error(),
			})
		},
	})

	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.API.AllowedOrigins,
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Workspace-ID"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowCredentials: true,
	}))

	handlers.NewAppHandler(service, cfg).Register(app)

	addr := fmt.Sprintf("%s:%s", cfg.API.Host, cfg.API.Port)
	log.Printf("BrokeStack API starting on http://%s", addr)
	log.Printf("API Reference available at http://%s/reference", addr)
	log.Printf("OpenAPI spec available at http://%s/openapi.yaml", addr)

	return app.Listen(addr)
}

func runMigrate(rootDir string) error {
	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required for migrations")
	}

	cmd := exec.Command(
		"atlas",
		"migrate",
		"apply",
		"--dir", "file://db/migrations",
		"--url", databaseURL,
		"--tx-mode", "file",
		"--exec-order", "linear",
	)
	cmd.Dir = rootDir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Env = os.Environ()
	return cmd.Run()
}

func runSeedSystem() error {
	cfg := config.Load()
	service, cleanup, err := openService(cfg)
	if err != nil {
		return err
	}
	defer cleanup()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	return service.SeedSystem(ctx)
}

func runHealthcheck() error {
	cfg := config.Load()
	service, cleanup, err := openService(cfg)
	if err != nil {
		return err
	}
	defer cleanup()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return service.CheckHealth(ctx)
}

func runBackupDB(args []string) error {
	if len(args) == 0 || strings.TrimSpace(args[0]) == "" {
		return fmt.Errorf("backup path is required")
	}
	if strings.TrimSpace(os.Getenv("DATABASE_URL")) == "" {
		return fmt.Errorf("DATABASE_URL is required for backup-db")
	}

	cmd := exec.Command(
		"pg_dump",
		"--clean",
		"--if-exists",
		"--format=plain",
		"--file", args[0],
		os.Getenv("DATABASE_URL"),
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Env = os.Environ()
	return cmd.Run()
}

func runRestoreDB(args []string) error {
	if len(args) == 0 || strings.TrimSpace(args[0]) == "" {
		return fmt.Errorf("backup path is required")
	}
	if strings.TrimSpace(os.Getenv("DATABASE_URL")) == "" {
		return fmt.Errorf("DATABASE_URL is required for restore-db")
	}

	cmd := exec.Command(
		"psql",
		"--set", "ON_ERROR_STOP=1",
		"--file", args[0],
		os.Getenv("DATABASE_URL"),
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Env = os.Environ()
	return cmd.Run()
}

func openService(cfg *config.Config) (*iam.Service, func(), error) {
	db, err := database.Open(cfg.Database)
	if err != nil {
		return nil, nil, fmt.Errorf("connect database: %w", err)
	}

	cleanup := func() {
		_ = db.Close()
	}
	return iam.NewService(db, cfg), cleanup, nil
}

func loadEnv(rootDir string) error {
	return godotenv.Load(filepath.Join(rootDir, ".env"))
}

func findRootDir() string {
	dir, err := os.Getwd()
	if err != nil {
		return "."
	}

	for {
		if _, err := os.Stat(filepath.Join(dir, ".env")); err == nil {
			return dir
		}
		if _, err := os.Stat(filepath.Join(dir, "package.json")); err == nil {
			return dir
		}

		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}

	return "."
}

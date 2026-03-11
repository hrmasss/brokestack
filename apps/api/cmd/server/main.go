package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
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

func main() {
	// Load .env from root directory
	rootDir := findRootDir()
	if err := godotenv.Load(filepath.Join(rootDir, ".env")); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := config.Load()
	db, err := database.Open(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}
	defer db.Close()

	service := iam.NewService(db, cfg)
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	if err := service.Bootstrap(ctx); err != nil {
		log.Fatalf("Failed to bootstrap IAM schema: %v", err)
	}

	// Create Fiber app
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

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Workspace-ID"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowCredentials: true,
	}))

	// Register routes
	handlers.NewAppHandler(service, cfg).Register(app)

	// Start server
	addr := fmt.Sprintf("%s:%s", cfg.API.Host, cfg.API.Port)
	log.Printf("BrokeStack API starting on http://%s", addr)
	log.Printf("📚 API Reference available at http://%s/reference", addr)
	log.Printf("📄 OpenAPI spec available at http://%s/openapi.yaml", addr)

	if err := app.Listen(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func findRootDir() string {
	// Start from current directory and walk up to find .env or root markers
	dir, err := os.Getwd()
	if err != nil {
		return "."
	}

	for {
		// Check if .env exists in this directory
		if _, err := os.Stat(filepath.Join(dir, ".env")); err == nil {
			return dir
		}
		// Check for package.json as root marker
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

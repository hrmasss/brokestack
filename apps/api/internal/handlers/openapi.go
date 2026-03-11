package handlers

import (
	_ "embed"

	"github.com/gofiber/fiber/v3"
)

//go:embed openapi.yaml
var openAPISpec []byte

// ServeOpenAPISpec serves the OpenAPI specification
func ServeOpenAPISpec(c fiber.Ctx) error {
	c.Set("Content-Type", "application/yaml")
	return c.Send(openAPISpec)
}

// ServeScalarReference serves the Scalar API Reference UI
func ServeScalarReference(c fiber.Ctx) error {
	html := `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrokeStack API Reference</title>
    <style>
        :root {
            --scalar-background-1: #0a0a0a;
            --scalar-background-2: #141414;
            --scalar-background-3: #1f1f1f;
            --scalar-color-1: #fafafa;
            --scalar-color-2: #a1a1aa;
            --scalar-color-3: #71717a;
            --scalar-color-accent: #72b48a;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
    </style>
</head>
<body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
        Scalar.createApiReference('#app', {
            url: '/openapi.yaml',
            theme: 'kepler',
            layout: 'modern',
            darkMode: true,
            hideDarkModeToggle: false,
            showSidebar: true,
            hideModels: false,
            hideDownloadButton: false,
            defaultHttpClient: {
                targetKey: 'shell',
                clientKey: 'curl'
            },
            metaData: {
                title: 'BrokeStack API Reference',
                description: 'Automation, tools, and workspace control-plane API'
            }
        })
    </script>
</body>
</html>`
	c.Set("Content-Type", "text/html")
	return c.SendString(html)
}

package main

import (
  "context"
  "database/sql"
  "fmt"
  "os"

  _ "github.com/uptrace/bun/driver/pgdriver"
)

func main() {
  db, err := sql.Open("pg", os.Getenv("DATABASE_URL"))
  if err != nil { panic(err) }
  defer db.Close()
  rows, err := db.QueryContext(context.Background(), "SELECT id, email, status FROM users ORDER BY created_at")
  if err != nil { panic(err) }
  defer rows.Close()
  for rows.Next() {
    var id, email, status string
    if err := rows.Scan(&id, &email, &status); err != nil { panic(err) }
    fmt.Println(id, email, status)
  }
}

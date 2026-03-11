package auth

import "testing"

func TestPasswordHashAndCheck(t *testing.T) {
	hash, err := HashPassword("super-secret")
	if err != nil {
		t.Fatalf("HashPassword returned error: %v", err)
	}

	if !CheckPassword(hash, "super-secret") {
		t.Fatal("expected password to validate against generated hash")
	}
	if CheckPassword(hash, "wrong-password") {
		t.Fatal("expected mismatched password to fail validation")
	}
}

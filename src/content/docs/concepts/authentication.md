---
title: "Authentication"
description: "How to authenticate requests to the Micelclaw OS API using JWT tokens, API keys, and system tokens."
---

Micelclaw OS supports three authentication mechanisms that coexist. Every authenticated request must include an `Authorization` header.

## Authentication paths

### 1. API Key (`clk_` prefix)

For programmatic access — skills, sync connectors, and admin scripts.

```
Authorization: Bearer clk_a1b2c3d4e5f6...
```

API keys are opaque tokens stored as SHA-256 hashes. The plaintext is shown only once at creation time.

**Format:** `clk_<32-hex-chars>`

**Scopes:**

| Scope | Identity resolution | Use case |
|---|---|---|
| `agent` | Always from `api_keys.user_id` (ignores headers) | Skills running in an agent workspace |
| `system` | `X-Claw-User-Id` header (required in multi-user mode) | Sync engine, admin CLI, internal operations |
| `sync` | Same as `system` | Sync connectors |

**Management (requires admin role):**

- `POST /admin/api-keys` — create key `{ user_id?, scope?, label? }` → returns `{ id, key, key_prefix, scope, ... }` (key visible only once)
- `GET /admin/api-keys` — list keys `?user_id=...&scope=...`
- `DELETE /admin/api-keys/:id` — revoke key
- `GET /api-keys/mine` — list your own keys

### 2. JWT (human users)

For the dashboard and frontend applications.

```
Authorization: Bearer <accessToken>
```

| Endpoint | Method | Description |
|---|---|---|
| `/auth/login` | POST | `{email, password}` → `{accessToken, refreshToken, user}` |
| `/auth/refresh` | POST | `{refresh_token}` → `{accessToken, refreshToken}` |
| `/auth/setup` | POST | Create initial user (only when 0 users exist) |
| `/auth/logout` | POST | Revoke refresh token |

**Token lifetime:** access token 24h, refresh token 30 days.

**JWT payload:** `{sub: userId, email, role: "owner"|"admin"|"user", iat, exp}`

### 3. System token

For internal operations during setup and bootstrapping. Generated during initial setup and stored in the environment configuration.

In **multi-user mode**, the system token requires the `X-Claw-User-Id` header to identify the target user. In **single-user mode**, the user context is resolved automatically.

## Public endpoints (no auth required)

These endpoints do not require a token:

- `GET /auth/status` — current mode (`setup`, `single_user`, `multi_user`)
- `POST /auth/setup` — create initial user (only if 0 users exist)
- `POST /auth/login` — login with email/password
- `POST /auth/register` — complete registration with invitation token
- `POST /auth/refresh` — rotate tokens
- `POST /auth/logout` — revoke refresh token
- `POST /auth/forgot-password` — request password reset (always returns 200)
- `POST /auth/reset-password` — reset password with `{token, new_password}`
- `GET /health` — health check

## Token detection

The auth middleware detects token type automatically:

1. If the token matches the system token → system authentication
2. If the token starts with `clk_` → API key lookup (hash in database)
3. Otherwise → JWT verification

## Unauthorized requests

Requests without a valid token receive:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

**Status:** `401 Unauthorized`

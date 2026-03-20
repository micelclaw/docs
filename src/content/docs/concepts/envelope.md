---
title: "API Envelope & Errors"
description: "Standard response format, error codes, and common headers used across all Micelclaw OS API endpoints."
---

All API responses follow a consistent envelope format. Understanding it once applies to every endpoint.

## Base URL

```
http://<your-server>:7200/api/v1
```

All endpoint paths in this documentation are relative to this base. Example: `POST /notes` → `http://<your-server>:7200/api/v1/notes`.

## Content types

- **Requests:** `application/json` (except file uploads, which use `multipart/form-data`)
- **Responses:** `application/json` always

## Response envelope

### Single record

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Meeting notes",
    "content": "Discussion points...",
    "created_at": "2026-02-16T10:30:00Z"
  }
}
```

### List (with pagination)

```json
{
  "data": [
    { "id": "...", "title": "Note 1" },
    { "id": "...", "title": "Note 2" }
  ],
  "meta": {
    "total": 87,
    "limit": 20,
    "offset": 0
  },
  "tier": "free"
}
```

### The `tier` field

Appears as a string (`"free"` or `"pro"`) in the response root. Indicates the user's current tier.

The Free tier has **no storage limits** — unlimited records in all domains. The difference between Free and Pro is **features**, not quantity:

| Feature | Free | Pro |
|---|---|---|
| Unlimited CRUD (all domains) | Yes | Yes |
| Full-text search | Yes | Yes |
| Semantic search (vector) | No | Yes |
| Sync connectors (Google, Apple...) | No | Yes |
| Digest Engine | No | Yes |
| Photo AI indexing | No | Yes |
| BYOK AI (your own API keys) | Yes | Yes |

When a Free user attempts a Pro feature, the endpoint returns `403 FEATURE_NOT_AVAILABLE`.

## Error format

All errors use this structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The 'title' field is required",
    "details": {
      "field": "title",
      "constraint": "required"
    }
  }
}
```

### Error codes

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid or missing fields in body |
| 400 | `INVALID_QUERY` | Invalid query parameters (sort, filter, fields) |
| 400 | `USER_CONTEXT_REQUIRED` | Multi-user: system token without user context headers |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Admin endpoint accessed by non-admin user |
| 403 | `FEATURE_NOT_AVAILABLE` | Feature requires Pro tier |
| 403 | `INSUFFICIENT_SCOPE` | API key lacks required scope |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Uniqueness conflict |
| 409 | `FILE_EXISTS` | Duplicate filename in same folder |
| 422 | `UNPROCESSABLE` | Valid JSON but semantically incorrect |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 503 | `SERVICE_UNAVAILABLE` | Dependent component unavailable |

## Common headers

### Request headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | Bearer token (API key, JWT, or system token) |
| `Content-Type` | Yes (POST/PATCH) | `application/json` or `multipart/form-data` |
| `X-Claw-User-Id` | No | UUID. Only with `scope:system` API keys for user impersonation |
| `X-Claw-Source` | No | Identifies the sync connector (e.g., `google-calendar`). Auto-sets the `source` field |
| `X-Request-Id` | No | UUID for tracing. Auto-generated if not sent |

### Response headers

| Header | Description |
|---|---|
| `X-Request-Id` | Request UUID (echo or auto-generated) |
| `X-Claw-Tier` | Current tier: `free` or `pro` |
| `X-Claw-Version` | Core version (e.g., `0.16.0`) |

## Versioning

The API uses URL prefix versioning (`/api/v1`). When breaking changes are introduced, `/api/v2` will be created and the previous version maintained for at least 6 months with a `Deprecation` header.

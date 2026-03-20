---
title: "Soft Deletes"
description: "How deletion, trash, and restore work across all Micelclaw OS domains."
---

Domains that support soft deletes (`notes`, `events`, `contacts`, `emails`, `files`, `diary`) follow these consistent rules.

## Operations

| Operation | Method | Behavior |
|---|---|---|
| List | `GET /resource` | Returns only active records (no `deleted_at`) |
| List with deleted | `GET /resource?include_deleted=true` | Includes records with `deleted_at` |
| List only deleted | `GET /resource?only_deleted=true` | Only records with `deleted_at` (trash view) |
| Soft delete | `DELETE /resource/:id` | Sets `deleted_at = now()`. Record is not removed |
| Permanent delete | `DELETE /resource/:id?permanent=true` | Removes the record from the database. **Irreversible** |
| Restore | `POST /resource/:id/restore` | Clears `deleted_at`. Record reappears in normal listings |

## Soft delete response

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deleted_at": "2026-02-16T14:00:00Z"
  }
}
```

**Status:** `200 OK`

## Permanent delete response

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deleted": true
  }
}
```

**Status:** `200 OK`

## Error cases

| Code | When |
|---|---|
| `409 ALREADY_DELETED` | Attempting to delete an already deleted record |
| `409 NOT_DELETED` | Attempting to restore a record that is not deleted |

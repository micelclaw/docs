---
title: "Notes"
description: "API reference for notes — create, read, update, delete, archive, and manage custom fields."
---

Base path: `/api/v1/notes`

## Create note

`POST /notes`

**Body:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string | No | `null` | Note title. Can be auto-generated from content |
| `content` | string | Yes | — | Note body |
| `content_format` | string | No | `"markdown"` | `markdown`, `html`, or `plain` |
| `tags` | string[] | No | `[]` | |
| `pinned` | boolean | No | `false` | |
| `custom_fields` | object | No | `null` | Arbitrary key-value data |

**Response:** `201 Created` with the full note object.

**WebSocket event:** `note.created`

### Example

```json
{
  "title": "Meeting notes",
  "content": "1. Budget review\n2. Q2 planning",
  "tags": ["work", "meetings"]
}
```

## List notes

`GET /notes`

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | |
| `offset` | integer | 0 | |
| `sort` | string | `updated_at` | Valid: `created_at`, `updated_at`, `title` |
| `order` | string | `desc` | `asc` or `desc` |
| `search` | string | — | Full-text search on title and content |
| `tag` | string | — | Filter by exact tag. Repeatable: `?tag=a&tag=b` (AND) |
| `pinned` | boolean | — | Filter pinned notes |
| `archived` | boolean | — | Filter archived notes. Default: excludes archived |
| `source` | string | — | Filter by origin: `local`, `google_keep`, etc. |
| `include_deleted` | boolean | `false` | Include soft-deleted notes |
| `only_deleted` | boolean | `false` | Only soft-deleted notes (trash view) |

**Response:** `200 OK` with list envelope.

Supports [`?format=compact`](/concepts/compact-format/) for token-optimized output.

## Get note

`GET /notes/:id`

**Response:** `200 OK` with single record envelope.

Returns `404 NOT_FOUND` if the note doesn't exist or is soft-deleted (unless `?include_deleted=true`).

## Update note

`PATCH /notes/:id`

Send only the fields to update.

**Updatable fields:** `title`, `content`, `content_format`, `tags`, `pinned`, `archived`, `custom_fields`

:::caution
`custom_fields` is **replaced entirely** when sent via PATCH. For incremental updates, use the custom fields merge endpoint below.
:::

**Response:** `200 OK` with the full updated note.

**WebSocket event:** `note.updated`

## Update custom fields (merge)

`PATCH /notes/:id/custom`

Incremental update via shallow merge.

**Body:** key-value pairs to merge.

- Existing keys are preserved
- New keys are added
- Keys with `null` value are removed

```json
{
  "category": "blog",
  "priority": null
}
```

If the note had `{"priority": "high"}`, the result is `{"category": "blog"}`.

**Response:** `200 OK` with the full note including updated `custom_fields`.

**WebSocket event:** `note.updated`

## Archive / Unarchive

`POST /notes/:id/archive` — sets `archived: true`

`POST /notes/:id/unarchive` — sets `archived: false`

**Response:** `200 OK`

**WebSocket event:** `note.updated`

## Delete note

`DELETE /notes/:id` — soft delete (sets `deleted_at`)

`DELETE /notes/:id?permanent=true` — permanent delete (irreversible)

See [Soft Deletes](/concepts/soft-deletes/) for details on delete behavior and restoration.

**WebSocket event:** `note.deleted`

## Restore note

`POST /notes/:id/restore` — clears `deleted_at`, note reappears in listings.

**WebSocket event:** `note.restored`

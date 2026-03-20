---
title: "Pagination & Filtering"
description: "How to paginate, sort, filter, and select fields across all list endpoints."
---

All list endpoints use a consistent pagination and filtering interface.

## Pagination

Offset-based pagination with two parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | Records per page. Maximum: 100 |
| `offset` | integer | 0 | Number of records to skip |

```
GET /api/v1/notes?limit=20&offset=40
```

Returns records 41–60. The `meta.total` field indicates the total count (excluding soft-deleted records unless explicitly requested).

## Sorting

All list endpoints accept:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `sort` | string | `created_at` | Field to sort by. Valid fields depend on the domain (documented per endpoint) |
| `order` | string | `desc` | Direction: `asc` or `desc` |

## Field selection

The `?fields=` parameter selects which fields to return in `data`, reducing response size.

```
GET /api/v1/events?fields=title,start_at,end_at,location
```

**Rules:**

| Rule | Behavior |
|---|---|
| No `?fields=` | Returns all fields (default) |
| `id` | Always included automatically |
| Envelope fields (`meta`, `tier`) | Never filtered — always present |
| Nested fields (`attendees.email`) | Not supported. Use the root field name (`attendees`) |
| `?fields=` + `?format=compact` | Mutually exclusive → `400 INVALID_QUERY` |
| Non-GET methods | `?fields=` is silently ignored |

### Available fields per domain

| Domain | Fields |
|---|---|
| Notes | `id`, `title`, `content`, `content_format`, `tags`, `pinned`, `archived`, `custom_fields`, `source`, `source_id`, `created_at`, `updated_at`, `synced_at`, `deleted_at` |
| Events | `id`, `title`, `description`, `location`, `start_at`, `end_at`, `all_day`, `recurrence`, `status`, `calendar_name`, `reminders`, `attendees`, `custom_fields`, `source`, `source_id`, `created_at`, `updated_at`, `synced_at`, `deleted_at` |
| Contacts | `id`, `display_name`, `first_name`, `last_name`, `emails`, `phones`, `company`, `job_title`, `addresses`, `notes`, `avatar_path`, `tags`, `custom_fields`, `source`, `source_id`, `created_at`, `updated_at`, `synced_at`, `deleted_at` |
| Emails | `id`, `message_id`, `thread_id`, `subject`, `from_address`, `from_name`, `to_addresses`, `cc_addresses`, `body_plain`, `body_html`, `has_attachments`, `folder`, `is_read`, `is_starred`, `received_at`, `account_id`, `status`, `created_at`, `updated_at`, `deleted_at` |
| Files | `id`, `filename`, `filepath`, `mime_type`, `size_bytes`, `parent_folder`, `is_directory`, `metadata`, `tags`, `custom_fields`, `created_at`, `updated_at`, `deleted_at` |
| Diary | `id`, `entry_date`, `content`, `mood`, `tags`, `weather`, `custom_fields`, `is_draft`, `created_at`, `updated_at`, `deleted_at` |

## Example

**Request:**

```
GET /api/v1/events?date=today&fields=title,start_at,end_at,location
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Standup",
      "start_at": "2026-02-18T09:00:00Z",
      "end_at": "2026-02-18T09:30:00Z",
      "location": "Discord"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 20,
    "offset": 0
  },
  "tier": "free"
}
```

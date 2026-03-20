---
title: "Events"
description: "API reference for calendar events — create, list, update, delete, with recurrence, reminders, and attendees."
---

Base path: `/api/v1/events`

## Create event

`POST /events`

**Body:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string | Yes | — | |
| `description` | string | No | `null` | |
| `location` | string | No | `null` | |
| `start_at` | datetime (ISO 8601) | Yes | — | |
| `end_at` | datetime | No | `null` | Defaults to 1 hour after `start_at` if omitted and `all_day` is false |
| `all_day` | boolean | No | `false` | |
| `recurrence` | object | No | `null` | RFC 5545 RRULE structure (see below) |
| `status` | string | No | `"confirmed"` | `confirmed`, `tentative`, `cancelled` |
| `calendar_name` | string | No | `"default"` | For multi-calendar support |
| `reminders` | object[] | No | `[]` | `[{type, minutes_before}]` |
| `attendees` | object[] | No | `[]` | `[{email, name, status}]` — status: `accepted`, `declined`, `tentative`, `pending` |
| `custom_fields` | object | No | `null` | Arbitrary key-value data |

**Response:** `201 Created` with the full event object.

**WebSocket event:** `event.created`

### Recurrence

The `recurrence` object follows RFC 5545 RRULE conventions:

```json
{
  "freq": "weekly",
  "byday": ["MO", "WE", "FR"],
  "until": "2026-06-30"
}
```

### Example

```json
{
  "title": "Weekly standup",
  "location": "Discord",
  "start_at": "2026-02-17T09:00:00Z",
  "end_at": "2026-02-17T09:30:00Z",
  "recurrence": { "freq": "weekly", "byday": ["MO"], "until": "2026-06-30" },
  "reminders": [{ "type": "notification", "minutes_before": 10 }],
  "attendees": [{ "email": "ana@example.com", "name": "Ana", "status": "accepted" }]
}
```

## List events

`GET /events`

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | |
| `offset` | integer | 0 | |
| `sort` | string | `start_at` | Valid: `start_at`, `created_at`, `updated_at`, `title` |
| `order` | string | `asc` | Note: defaults to `asc` (chronological) |
| `search` | string | — | Full-text search on title and description |
| `date` | string | — | Convenience filter: `today`, `tomorrow`, `this_week`, `this_month`, or ISO date (`2026-02-17`) |
| `from` | datetime | — | Events starting from this date (inclusive) |
| `to` | datetime | — | Events starting up to this date (inclusive) |
| `calendar_name` | string | — | Filter by calendar name |
| `status` | string | — | Filter by status |
| `source` | string | — | Filter by origin |
| `include_deleted` | boolean | `false` | Include soft-deleted events |
| `only_deleted` | boolean | `false` | Only soft-deleted events (trash view) |

:::note
The `date` parameter is a convenience shortcut. `?date=today` is equivalent to `?from=<start-of-day>&to=<end-of-day>`. When `date` is used, `from` and `to` are ignored.
:::

**Response:** `200 OK` with list envelope.

Supports [`?format=compact`](/concepts/compact-format/) for token-optimized output.

## Get event

`GET /events/:id`

**Response:** `200 OK` with single record envelope.

Returns `404 NOT_FOUND` if the event doesn't exist or is soft-deleted.

## Update event

`PATCH /events/:id`

Send only the fields to update.

**Updatable fields:** `title`, `description`, `location`, `start_at`, `end_at`, `all_day`, `recurrence`, `status`, `calendar_name`, `reminders`, `attendees`, `custom_fields`

:::caution
`custom_fields` is **replaced entirely** when sent via PATCH. For incremental updates, use the custom fields merge endpoint below.
:::

**Response:** `200 OK` with the full updated event.

**WebSocket event:** `event.updated`

## Update custom fields (merge)

`PATCH /events/:id/custom`

Incremental update via shallow merge. Same behavior as [Notes custom fields](/api/notes/#update-custom-fields-merge).

**Response:** `200 OK` with the full event.

**WebSocket event:** `event.updated`

## Delete event

`DELETE /events/:id` — soft delete (sets `deleted_at`)

`DELETE /events/:id?permanent=true` — permanent delete (irreversible)

See [Soft Deletes](/concepts/soft-deletes/) for details.

**WebSocket event:** `event.deleted`

## Restore event

`POST /events/:id/restore` — clears `deleted_at`, event reappears in listings.

**WebSocket event:** `event.restored`

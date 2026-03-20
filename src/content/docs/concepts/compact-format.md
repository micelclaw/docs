---
title: "Compact Format"
description: "Token-optimized response format for AI agents and list endpoints."
---

The `?format=compact` parameter transforms list responses into a format optimized for LLM consumption, significantly reducing token usage.

## Usage

```
GET /api/v1/events?date=today&format=compact
```

## Rules

| Rule | Behavior |
|---|---|
| Applies to | GET list endpoints (`data` is an array) |
| `GET /:id` (single record) | `?format=compact` is silently ignored — returns standard JSON |
| `?format=compact` + `?fields=` | Mutually exclusive → `400 INVALID_QUERY` |
| Existing filters | Work normally (`?date=today`, `?folder=INBOX`, `?search=`, `?tag=`, etc.) |
| Pagination | `?limit=` and `?offset=` work normally |
| Errors | Always in standard JSON error format |
| POST/PATCH/DELETE | `?format=compact` is silently ignored |

## Response structure

```json
{
  "format": "compact",
  "summary": "3 events (today)",
  "lines": [
    "09:00-09:30 Standup [Discord] 🔁 id:550e8400",
    "14:00-15:00 Lunch with Ana [La Mar] id:660e8400",
    "📅 all-day: Mom's Birthday id:770e8400"
  ],
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001",
    "770e8400-e29b-41d4-a716-446655440002"
  ],
  "meta": {
    "total": 3,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

### Fields

| Field | Type | Description |
|---|---|---|
| `format` | string | Always `"compact"`. Lets the client distinguish response type |
| `summary` | string | Human-readable summary line with active filters and pagination info |
| `lines` | string[] | One line per record, domain-specific format |
| `ids` | string[] | Full UUIDs in the same order as `lines` |
| `meta.has_more` | boolean | `true` if more pages exist |

## Line formats by domain

| Domain | Line format |
|---|---|
| Notes | `📌 "title" (tags) [relative_date] [archived] id:XXXXXXXX` |
| Events | `HH:MM-HH:MM title [location] 🔁 id:XXXXXXXX` |
| Emails | `from: "subject" [FOLDER] read/unread ⭐ 📎 relative_date id:XXXXXXXX` |
| Contacts | `name — company — email id:XXXXXXXX` |
| Files | `filename (size) [type] id:XXXXXXXX` |
| Diary | `date 😊 "content_preview" (tags) id:XXXXXXXX` |
| Search | `[domain] "title" — "snippet" id:XXXXXXXX` |

## Example

**Request:**

```
GET /api/v1/notes?tag=work&format=compact
```

**Response (200 OK):**

```json
{
  "format": "compact",
  "summary": "2 notes (tag:work)",
  "lines": [
    "📌 \"Meeting notes Q1\" (work) [2w ago] id:770e8400",
    "\"Project ideas\" (work, dev) [3d ago] id:880e8400"
  ],
  "ids": [
    "770e8400-e29b-41d4-a716-446655440002",
    "880e8400-e29b-41d4-a716-446655440003"
  ],
  "meta": {
    "total": 2,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

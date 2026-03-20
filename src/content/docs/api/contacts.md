---
title: "Contacts"
description: "API reference for contacts — create, list, update, delete, with emails, phones, addresses, and custom fields."
---

Base path: `/api/v1/contacts`

## Create contact

`POST /contacts`

**Body:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `display_name` | string | Yes | — | Auto-generated from `first_name`/`last_name` if not provided |
| `first_name` | string | No | `null` | |
| `last_name` | string | No | `null` | |
| `emails` | object[] | No | `[]` | `[{address, label, primary}]` — label: `work`, `personal`, `other` |
| `phones` | object[] | No | `[]` | `[{number, label, primary}]` — label: `mobile`, `work`, `home`, `other` |
| `company` | string | No | `null` | |
| `job_title` | string | No | `null` | |
| `addresses` | object[] | No | `[]` | `[{street, city, state, postal_code, country, label}]` |
| `notes` | string | No | `null` | Free-text notes about the contact |
| `avatar_path` | string | No | `null` | Path to image in the local file system |
| `tags` | string[] | No | `[]` | |
| `custom_fields` | object | No | `null` | Arbitrary key-value data |

**Response:** `201 Created` with the full contact object.

**WebSocket event:** `contact.created`

### Example

```json
{
  "display_name": "Ana García",
  "first_name": "Ana",
  "last_name": "García",
  "emails": [{ "address": "ana@example.com", "label": "work", "primary": true }],
  "phones": [{ "number": "+34612345678", "label": "mobile", "primary": true }],
  "company": "Acme Labs",
  "job_title": "Head of Partnerships",
  "tags": ["partnership"]
}
```

## List contacts

`GET /contacts`

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | |
| `offset` | integer | 0 | |
| `sort` | string | `display_name` | Valid: `display_name`, `created_at`, `updated_at`, `company` |
| `order` | string | `asc` | Defaults to `asc` (alphabetical) |
| `search` | string | — | Full-text search on name, emails, phones, company, notes |
| `tag` | string | — | Filter by tag. Repeatable: `?tag=a&tag=b` (AND) |
| `company` | string | — | Filter by company (partial match, case-insensitive) |
| `source` | string | — | Filter by origin |
| `include_deleted` | boolean | `false` | Include soft-deleted contacts |
| `only_deleted` | boolean | `false` | Only soft-deleted contacts (trash view) |

**Response:** `200 OK` with list envelope.

Supports [`?format=compact`](/concepts/compact-format/) for token-optimized output.

## Get contact

`GET /contacts/:id`

**Response:** `200 OK` with single record envelope.

Returns `404 NOT_FOUND` if the contact doesn't exist or is soft-deleted.

## Update contact

`PATCH /contacts/:id`

Send only the fields to update.

**Updatable fields:** `display_name`, `first_name`, `last_name`, `emails`, `phones`, `company`, `job_title`, `addresses`, `notes`, `avatar_path`, `tags`, `custom_fields`

:::caution
Array fields (`emails`, `phones`, `addresses`, `tags`) are **replaced entirely** with the value sent. To add an email without losing existing ones, send the complete array. `custom_fields` is also replaced entirely — for incremental updates, use the custom fields merge endpoint below.
:::

**Response:** `200 OK` with the full updated contact.

**WebSocket event:** `contact.updated`

## Update custom fields (merge)

`PATCH /contacts/:id/custom`

Incremental update via shallow merge. Same behavior as [Notes custom fields](/api/notes/#update-custom-fields-merge).

**Response:** `200 OK` with the full contact.

**WebSocket event:** `contact.updated`

## Delete contact

`DELETE /contacts/:id` — soft delete (sets `deleted_at`)

`DELETE /contacts/:id?permanent=true` — permanent delete (irreversible)

See [Soft Deletes](/concepts/soft-deletes/) for details.

**WebSocket event:** `contact.deleted`

## Restore contact

`POST /contacts/:id/restore` — clears `deleted_at`, contact reappears in listings.

**WebSocket event:** `contact.restored`

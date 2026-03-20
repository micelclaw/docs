---
title: "Emails"
description: "API reference for emails — CRUD, compose and send, drafts, snooze, batch operations, and threading."
---

Base path: `/api/v1/emails`

## Register email

`POST /emails`

Used by sync connectors to register incoming emails, or to create drafts/outgoing emails programmatically.

**Body:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `message_id` | string | No | `null` | RFC 5322 Message-ID |
| `thread_id` | string | No | auto | Auto-resolved from `references`/`in_reply_to` if not provided |
| `subject` | string | No | `null` | |
| `from_address` | string | Yes | — | |
| `from_name` | string | No | `null` | |
| `to_addresses` | object[] | No | `[]` | `[{address, name}]` |
| `cc_addresses` | object[] | No | `[]` | `[{address, name}]` |
| `bcc_addresses` | object[] | No | `[]` | `[{address, name}]` — only for outgoing/drafts |
| `body_plain` | string | No | `null` | Plain text version |
| `body_html` | string | No | `null` | HTML version |
| `has_attachments` | boolean | No | `false` | |
| `attachments` | object[] | No | `[]` | `[{filename, mime, size, path}]` |
| `folder` | string | No | `"INBOX"` | e.g., `INBOX`, `SENT`, `DRAFTS`, `TRASH`, `SPAM`, `OUTBOX`, `SNOOZED` |
| `is_read` | boolean | No | `false` | |
| `is_starred` | boolean | No | `false` | |
| `received_at` | datetime | Conditional | — | Required if `status='received'` |
| `account_id` | UUID | No | `null` | Email account reference |
| `status` | string | No | `"received"` | See [Status values](#status-values) |
| `in_reply_to` | string | No | `null` | Message-ID of the replied email |
| `references` | string[] | No | `[]` | Thread Message-ID chain (RFC 5322) |
| `labels` | string[] | No | `[]` | Additional labels |
| `custom_fields` | object | No | `null` | Arbitrary key-value data |

**Response:** `201 Created` with the full email object.

**WebSocket event:** `email.created`

## List emails

`GET /emails`

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | |
| `offset` | integer | 0 | |
| `sort` | string | `received_at` | Valid: `received_at`, `created_at`, `subject` |
| `order` | string | `desc` | |
| `search` | string | — | Full-text search on subject, from_address, from_name, body |
| `folder` | string | — | Filter by folder |
| `is_read` | boolean | — | |
| `is_starred` | boolean | — | |
| `has_attachments` | boolean | — | |
| `thread_id` | string | — | Get all emails in a thread |
| `from` | datetime | — | Emails received from this date |
| `to` | datetime | — | Emails received until this date |
| `account_id` | UUID | — | Filter by email account |
| `status` | string | — | Filter by status |
| `label` | string | — | Filter by label |
| `snoozed` | boolean | — | `true`: only snoozed. `false`: exclude snoozed |
| `include_deleted` | boolean | `false` | |
| `only_deleted` | boolean | `false` | |

:::note
Snoozed emails are moved to `folder='SNOOZED'`, so `GET /emails?folder=INBOX` does **not** return them. Use `?folder=SNOOZED` or `?snoozed=true` to view snoozed emails.
:::

**Response:** `200 OK` with list envelope.

Supports [`?format=compact`](/concepts/compact-format/) for token-optimized output.

## Get email

`GET /emails/:id`

**Response:** `200 OK` with single record envelope.

## Update email

`PATCH /emails/:id`

**Updatable fields:** `folder`, `is_read`, `is_starred`, `custom_fields`, `labels`

:::caution
Only management metadata can be updated — email content is immutable. The `status` field cannot be changed via PATCH; use the dedicated endpoints (`/send`, `/snooze`, etc.) instead.
:::

**Response:** `200 OK` with the full updated email.

**WebSocket event:** `email.updated`

## Update custom fields (merge)

`PATCH /emails/:id/custom`

Incremental update via shallow merge. Same behavior as [Notes custom fields](/api/notes/#update-custom-fields-merge).

**Response:** `200 OK` with the full email.

**WebSocket event:** `email.updated`

## Compose and send

`POST /emails/send`

Creates and queues an email for sending in a single step.

**Body:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `account_id` | UUID | No | default account | Uses the account with `is_default=true` if omitted |
| `to_addresses` | object[] | Yes | — | At least one recipient. `[{address, name}]` |
| `cc_addresses` | object[] | No | `[]` | |
| `bcc_addresses` | object[] | No | `[]` | |
| `subject` | string | No | `null` | |
| `body_plain` | string | Conditional | `null` | At least `body_plain` or `body_html` required |
| `body_html` | string | Conditional | `null` | |
| `in_reply_to` | string | No | `null` | Message-ID of the email being replied to |
| `attachments` | UUID[] | No | `[]` | Array of file IDs |
| `read_receipt_requested` | boolean | No | `false` | |
| `scheduled_at` | datetime | No | `null` | If set, schedules the email for future sending |

**Response:** `202 Accepted`

**WebSocket event:** `email.queued` (or `email.scheduled` if `scheduled_at` is set)

**Errors:**

| HTTP | Code | When |
|---|---|---|
| 422 | `NO_DEFAULT_ACCOUNT` | No `account_id` and no default account configured |
| 422 | `ACCOUNT_NOT_CONNECTED` | Account is not in `connected` status |

## Save draft

`POST /emails/drafts`

Creates a draft with minimal fields.

**Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `account_id` | UUID | No | Uses default account if omitted |
| `to` | string | No | Primary recipient |
| `cc` | string | No | |
| `bcc` | string | No | |
| `subject` | string | No | |
| `body_plain` | string | No | |
| `body_html` | string | No | |
| `attachments` | UUID[] | No | Array of file IDs |
| `in_reply_to` | string | No | Message-ID of replied email |

**Response:** `201 Created`

**WebSocket event:** `email.created`

## Send draft

`POST /emails/:id/send`

Queues an existing draft for sending. The email must have `status` of `draft` or `failed` (manual retry).

**Response:** `202 Accepted`

**WebSocket event:** `email.queued`

**Errors:**

| HTTP | Code | When |
|---|---|---|
| 409 | `NOT_A_DRAFT` | Email is not a draft or failed |
| 409 | `ALREADY_SENT` | Email was already sent |

## Snooze / Unsnooze

`POST /emails/:id/snooze`

**Body:**

```json
{
  "until": "2026-02-20T09:00:00Z"
}
```

Moves the email to `SNOOZED` folder and schedules it to return to its original folder at the specified time.

**Response:** `200 OK` — **WebSocket event:** `email.snoozed`

---

`POST /emails/:id/unsnooze`

Returns the email to its original folder immediately.

**Response:** `200 OK` — **WebSocket event:** `email.unsnoozed`

**Error:** `409 NOT_SNOOZED` if the email is not snoozed.

## Shortcuts

- `POST /emails/:id/read` — Mark as read
- `POST /emails/:id/unread` — Mark as unread
- `POST /emails/:id/star` — Star
- `POST /emails/:id/unstar` — Unstar

All return `200 OK` and emit `email.updated`.

## Batch operations

`POST /emails/batch`

**Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `ids` | UUID[] | Yes | Maximum 100 |
| `action` | string | Yes | See actions below |
| `params` | object | Conditional | Required for `move`, `add_label`, `remove_label`, `snooze` |

**Actions:**

| Action | Params | Description |
|---|---|---|
| `mark_read` | — | Mark as read |
| `mark_unread` | — | Mark as unread |
| `star` | — | Star |
| `unstar` | — | Unstar |
| `move` | `{ "folder": "..." }` | Move to folder |
| `add_label` | `{ "label": "..." }` | Add label |
| `remove_label` | `{ "label": "..." }` | Remove label |
| `delete` | — | Soft delete |
| `restore` | — | Restore from trash |
| `snooze` | `{ "until": "datetime" }` | Batch snooze |

**Response:** `200 OK` with `{ processed, failed, errors }`.

## Delete email

`DELETE /emails/:id` — soft delete

`DELETE /emails/:id?permanent=true` — permanent delete (irreversible)

See [Soft Deletes](/concepts/soft-deletes/) for details.

**WebSocket event:** `email.deleted`

## Restore email

`POST /emails/:id/restore`

**WebSocket event:** `email.restored`

## Status values

| Status | Description | Typical folder |
|---|---|---|
| `received` | Incoming email synced via IMAP | INBOX |
| `draft` | Draft created by user | DRAFTS |
| `queued` | Ready to send, in queue | OUTBOX |
| `sending` | Currently being sent | OUTBOX |
| `sent` | Successfully sent | SENT |
| `failed` | Send failed after retries | OUTBOX |

---
title: "WebSocket"
description: "Real-time event streaming via WebSocket — connection, authentication, message format, event catalog, and heartbeat."
---

The WebSocket interface provides real-time push notifications for all data changes and system events.

## Connection

```
ws://<your-server>:7200/ws?token=<JWT_ACCESS_TOKEN>
```

The JWT token is passed as a query parameter because the browser WebSocket API does not support custom headers. The server validates the JWT and associates the connection with the user.

If the token is invalid, the server closes the connection with code `4401`.

## Message format

All server events follow this structure:

```json
{
  "event": "note.created",
  "data": {
    "id": "550e8400-...",
    "title": "Meeting notes",
    "created_at": "2026-02-16T10:30:00Z"
  },
  "timestamp": "2026-02-16T10:30:00.123Z"
}
```

## Client actions

The client sends JSON messages with `{ "action": "...", "data": {...} }`:

| Action | Description | Data |
|---|---|---|
| `chat.send` | Send message to AI agent | `{message, conversation_id, agent?, context?}` |
| `subscribe` | Subscribe to specific events | `{events: ["note.*", ...]}` |
| `unsubscribe` | Unsubscribe from events | `{events: ["agent.*"]}` |
| `pong` | Heartbeat response | *(none)* |

## Subscription

By default, the client receives all events. To filter:

```json
{
  "action": "subscribe",
  "events": ["note.*", "event.*", "sync.*"]
}
```

**Patterns:**
- `"note.created"` — specific event
- `"note.*"` — all events for a domain
- `"*"` — all events (default)

Subscriptions can be changed at any time during the connection.

## Heartbeat

The server sends a `ping` every **30 seconds**:

```json
{ "event": "ping", "timestamp": "2026-02-16T10:30:30.000Z" }
```

The client must respond with `{ "action": "pong" }`. Connections without a pong within **90 seconds** are closed.

## Event catalog

### Data domain events

Emitted when records change via REST API. Pattern: `<domain>.<action>`.

| Domain | Events | Data |
|---|---|---|
| Notes | `note.created`, `updated`, `deleted`, `restored` | Full record (or `{id, permanent}` for delete) |
| Events | `event.created`, `updated`, `deleted`, `restored` | Full record |
| Contacts | `contact.created`, `updated`, `deleted`, `restored` | Full record |
| Emails | `email.created`, `updated`, `deleted`, `restored` | Full record |
| Emails (send) | `email.queued`, `sent`, `send_failed`, `snoozed`, `unsnoozed`, `scheduled` | Varies per event |
| Email Accounts | `email_account.created`, `updated`, `deleted`, `status_changed` | Full record / status details |
| Files | `file.created`, `updated`, `deleted`, `restored` | Full record |
| Diary | `diary.created`, `updated`, `deleted`, `restored` | Full record |
| Bookmarks | `bookmark.created`, `updated`, `deleted`, `checked` | Record / `{id, is_alive, status_code}` |
| Albums | `album.created`, `updated`, `deleted`, `restored`, `photo_added`, `photo_removed` | Record / photo details |
| Shares | `share.created`, `deleted` | Share details |
| Snapshots | `snapshot.created`, `restored`, `deleted`, `purged` | Snapshot details |

### AI & Chat events

| Event | When | Data |
|---|---|---|
| `chat.stream.start` | Agent starts processing | `{conversation_id, agent}` |
| `chat.stream.token` | Partial response token | `{conversation_id, token}` |
| `chat.stream.done` | Full response complete | `{conversation_id, full_text, model, tokens_used}` |

### Approval events

| Event | When | Data |
|---|---|---|
| `approval.requested` | Approval requested | `{id, action, domain, record_id, level}` |
| `approval.resolved` | Approval resolved | `{id, decision, resolved_by}` |
| `approval.expired` | Approval expired | `{id, action, expired_at}` |

### Digest events

| Event | When | Data |
|---|---|---|
| `digest.ready` | Digest compiled | `{digest_id, alert_level, summary, changes_count, domains}` |
| `digest.urgent` | Urgent digest | `{digest_id, alert_level: "URGENT", summary}` |

### Voice events

| Event | When | Data |
|---|---|---|
| `voice.session_started` | Voice session started | `{session_id, channel, language}` |
| `voice.transcription` | Transcription received | `{session_id, text, confidence, is_final}` |
| `voice.response` | Voice response generated | `{session_id, text, audio_url?}` |
| `voice.session_ended` | Voice session ended | `{session_id, duration_ms}` |

### Sync events

| Event | When | Data |
|---|---|---|
| `sync.started` | Connector started syncing | `{connector_id, started_at}` |
| `sync.progress` | Sync progress update | `{connector_id, records_processed, total_estimated}` |
| `sync.completed` | Sync completed | `{connector_id, records_created, records_updated, duration_ms}` |
| `sync.error` | Sync error | `{connector_id, error_message}` |

### System events

| Event | When | Data |
|---|---|---|
| `system.health_changed` | Service status changed | `{service, old_status, new_status}` |
| `system.storage_alert` | Disk full or SMART warning | `{disk_id, alert_type, message}` |
| `settings.updated` | Configuration updated | `{section, changes}` |
| `license.changed` | Tier changed | `{old_tier, new_tier}` |

### Browser session events

| Event | When | Data |
|---|---|---|
| `browser.started` | Browser session started | `{session_id}` |
| `browser.navigating` | Navigating to URL | `{session_id, url}` |
| `browser.snapshot` | Screenshot captured | `{session_id, base64, url?, screenshot_id?}` |
| `browser.complete` | Session ended | `{session_id, pages_visited}` |

### Agent events

| Event | When | Data |
|---|---|---|
| `agent.session_started` | New agent session | `{session_id, agent, model}` |
| `agent.session_ended` | Session ended | `{session_id, agent, tokens_used, duration_ms}` |
| `agent.message` | Agent message (streaming) | `{session_id, from_agent, to_agent, message_preview}` |

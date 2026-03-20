---
title: "API Reference Overview"
description: "Quick reference table of all Micelclaw OS API endpoints organized by domain."
---

This page provides a quick reference of all available API endpoints. Click on any domain name to see its full documentation.

Before using any endpoint, read the [Concepts](/concepts/authentication/) section to understand authentication, envelope format, and pagination.

## Data domains

| Domain | Base path | Operations |
|---|---|---|
| [Notes](/api/notes/) | `/notes` | CRUD, archive, custom fields |
| [Events](/api/events/) | `/events` | CRUD, recurrence, custom fields |
| [Contacts](/api/contacts/) | `/contacts` | CRUD, custom fields |
| [Emails](/api/emails/) | `/emails` | CRUD, send, snooze, batch, read/star |
| [Email Accounts](/api/email-accounts/) | `/email-accounts` | CRUD, test connection, IMAP folders |
| [Files & Drive](/api/files/) | `/files` | Upload, mkdir, CRUD, preview, download |
| [Photos](/api/photos/) | `/photos`, `/albums` | Timeline, search, albums, AI pipeline |
| [Diary](/api/diary/) | `/diary` | CRUD, append, stats |
| [Bookmarks](/api/bookmarks/) | `/bookmarks` | CRUD, tags, domains, check-alive |
| [Feeds (RSS)](/api/feeds/) | `/feeds` | Subscribe, discover, articles, OPML |
| [Search](/api/search/) | `/search` | Cross-domain full-text and semantic search |
| [Entity Links & Graph](/api/entity-links/) | `/links`, `/graph` | Cross-domain entity relationships |
| [Kanban (Projects)](/api/kanban/) | `/kanban` | Boards, columns, cards, labels, checklists |
| [Diagrams](/api/diagrams/) | `/diagrams` | CRUD for diagram documents |

## Infrastructure

| Domain | Base path | Operations |
|---|---|---|
| [Storage (HAL)](/infrastructure/storage/) | `/storage` | Volumes, SMART data, mount points |
| [Network & Proxy](/infrastructure/network/) | `/network`, `/hal/network/proxy` | Interfaces, reverse proxy, SSL |
| [DNS](/infrastructure/dns/) | `/dns` | Zones, records, DDNS, providers |
| [VPN](/infrastructure/vpn/) | `/wg-easy`, `/hal/network/tailscale` | WireGuard, Tailscale |
| [Processes](/infrastructure/processes/) | `/hal/processes` | Process manager |
| [Managed Services](/infrastructure/managed-services/) | `/portainer`, `/termix` | Docker containers lifecycle |

## AI & Intelligence

| Domain | Base path | Operations |
|---|---|---|
| [Digest Engine](/intelligence/digest/) | `/digest` | Pending changes, config, smart digest |
| [Knowledge Graph](/intelligence/knowledge-graph/) | `/graph` | Entity relationships, visualization |
| [Entity Extraction](/intelligence/entity-extraction/) | `/graph/re-extract` | Batch entity extraction pipeline |
| [Voice (STT/TTS)](/intelligence/voice/) | `/voice` | Speech-to-text, text-to-speech |

## Integrations

| Domain | Base path | Operations |
|---|---|---|
| [Finance Suite](/integrations/finance/) | `/finance` | Firefly III + SolidInvoice lifecycle |
| [Crypto Stack](/integrations/crypto/) | `/crypto` | BTC, Lightning, Monero, Electrs |
| [Mail Server](/integrations/mail-server/) | `/mail/server` | DNS checks, relay, provisioning |
| [Multimedia Suite](/integrations/multimedia/) | `/multimedia` | Servarr stack setup and management |

## Common patterns

All endpoints share these conventions:

- **Authentication:** Bearer token in `Authorization` header ([details](/concepts/authentication/))
- **Envelope:** Responses wrapped in `{ data }` or `{ data, meta }` ([details](/concepts/envelope/))
- **Pagination:** `?limit=` and `?offset=` on all list endpoints ([details](/concepts/pagination/))
- **Compact format:** `?format=compact` for token-optimized responses ([details](/concepts/compact-format/))
- **Soft deletes:** `DELETE` sets `deleted_at`, `?permanent=true` for hard delete ([details](/concepts/soft-deletes/))

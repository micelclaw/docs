---
title: Build a Data Connector
description: Manifest, adapter contracts, authentication, UI, ownership and certification for Micelclaw data connectors.
---

The connector development SDK supports **reviewed adapters contributed to Micelclaw**. It does not load arbitrary third-party packages into Core, and it is not a published npm package. Start from an authorized development checkout.

The checkout's `CONTRIBUTING.md` still limits public Core/Dash contributions. External contributors should propose the integration through the RFC path and obtain authorized access. These SDK instructions do not change the source license or open public Core pull requests.

The SDK covers **all nine data types**, including normalized payload validation. Provider profiles include native source references for Mail, Tasks, Calendar and Contacts, plus development profiles for Notes, Files, Photos, Music and Feeds. `existing` links to code; an example runs against fixtures. Production SDK registration still requires the complete data path and real certification.

## Create a development template

From the Micelclaw OS repository root:

```sh
pnpm -C core sdk:connector acme-notes notes
pnpm -C core test:sdk
pnpm -C core exec tsc --noEmit
```

The generator creates `sdk/connectors/acme-notes/manifest.json` , an `adapter.ts` template and its development instructions. It refuses to overwrite an existing directory. It does not register or install the adapter.

Implement the types in `core/src/sync/sdk/contract.ts`. `examples/existing-data-domains.ts` covers Mail, Tasks, Calendar and Contacts; other executable examples include `nextcloud-notes.ts`, `miniflux.ts`, `markdown-folder.ts`, `opml.ts` and `mounted-files.ts`. They use host-provided capabilities and fixture data; production persistence and UI rollout still require certification.

## Manifest

[Download the v1 JSON Schema](/sdk/connectors/manifest.schema.json). Structural JSON validation must be followed by `parseManifest()`, which also checks relationships between authentication, modes and capabilities.

| Field | Contract |
| --- | --- |
| `id`, `api_version`, `min_core_version` | Stable adapter type; API version `1.0`; compatible Core version. |
| `data_types` | `mail`, `contacts`, `calendar`, `tasks`, `notes`, `files`, `photos`, `music`, `feeds`. |
| `modes_by_type` | `import`, `mirror` or `mounted`; v1 allows one mode per data type and manifest. Register import and mirror separately when capabilities differ. |
| `auth` | Accepted methods, labeled fields and instructions for obtaining/revoking credentials. |
| `scopes_by_type` | Required for OAuth; minimum permissions for each declared data type. |
| `collections` | Whether users can select folders, notebooks, albums, playlists or feed categories. |
| `capabilities` | Implemented read, incremental, push, write, deletion propagation, media bytes and read-state support. |
| `limitations`, `limits` | Visible limitations and enforced page, record-size and run bounds. |

Authentication is a discriminated contract: `oauth2`, `api_token`, `app_password`, `basic`, `ssh_key`, `s3_key`, `local_folder` or `none`. Do not force every provider through OAuth or WebDAV. A password and an application password may share an HTTP mechanism while requiring different account instructions.

`examples/auth-methods.ts` provides eight validated form declarations to adapt, including OAuth scopes, SSH host fingerprint, S3 credentials, a folder grant and an OPML file. They contain no credential values. The host must verify the SSH fingerprint out of band, S3 bucket/prefix permissions and folder grants; entering a path or host name does not authorize access.

Fields describe input shape; they must not contain credential values or defaults. Secrets are sent to authenticated Core over HTTPS and stored encrypted through the existing vault. Never include credentials in a manifest, URL, log, screenshot or test fixture.

## Adapter contract

Every adapter verifies identity, lists collections and supports source-scoped disconnection.

- **Mirror:** `pull({cursor, selection, limit, signal})` returns bounded records and a continuation cursor. `push` is required for advertised mirror writes.
- **Import:** `start(...)` yields pages for a persisted, cancelable job. There is no periodic poll for an import.
- **Mounted files:** use the VFS path in Explorer. Read-only mounts have no mutation methods. Writable mounts require authorized write, move and delete operations and conflict preservation.

The mounted example passes the expected revision to its host's conditional write capability. A plain existing `VfsProvider` does not guarantee durable caching or conflict preservation; complete and certify that host behavior before advertising it. Never cast a provider to the stronger capability as a shortcut.

```json
{
  "remote_id": "42",
  "collection_id": "Work",
  "revision": "remote-etag",
  "data_type": "notes",
  "deleted": false,
  "payload": {
    "title": "Example",
    "content": "# Example",
    "content_format": "markdown"
  }
}
```

`domain-payloads.ts` validates all nine domains. Mail, Tasks, Calendar and Contacts are described below; the others cover note content/display format, feed subscriptions, file tree metadata, photo staged originals/capture dates/albums and ordered music references with explicit local matching. The host must additionally verify ownership of staged files and matched local song IDs. Native representations are retained separately when conversion would lose fields.

[Download the nine-domain payload JSON Schema](/sdk/connectors/payloads.schema.json). It describes `{data_type, payload}`, not the complete `RemoteRecord` envelope. Run `validateDomainPayload()` for date/cross-field invariants and host authorization as well.

Identity is `(user_id, provider, external_account_id, data_type)`. Use the provider's stable account ID and remote record IDs. A display email, filename or playlist title is not a stable identity.

`runAdapter()` rejects unselected collections, invalid pages, unauthorized tombstones, oversized records and stalled cursors. The materialization host must validate the domain payload and atomically persist domain records, source links and checkpoint, then run the existing post-CRUD hooks. Replay must be idempotent. The fixture host is not a durable production queue.

The SDK JSON transport supports GET/POST, pinned DNS, valid TLS, origin confinement, total deadlines and response byte limits. It rejects redirects. Media streams, range reads and file mutations must use an equally guarded media/VFS host; raw plugin `fetch` is not a substitute.

## Mail, Tasks, Calendar and Contacts

`examples/existing-data-domains.ts` supplies four explicit manifests and a mirror recipe: Mail with Google OAuth, Tasks with an API token, Calendar with Basic/CalDAV and Contacts with an application password/CardDAV. Copy the normalized fixtures from `existing-data-domain-fixtures.ts`, then implement the authorized provider port. These recipes perform reads; they do not install replacements for native connectors. The Mail recipe requests `gmail.readonly` and requires a separately approved host OAuth contract. The current native `gmail` type has broader permissions and is not this example's creation path.

| SDK type → native consumer | Data and behavior |
| --- | --- |
| `mail` → `emails` and `/mail` account | Message/thread IDs, sender/recipients/CC/BCC, text/HTML, received time, folders/labels, read/star flags, threading references and authorized attachments. The host binds the local account. Sanitize HTML before display; keep sending separate from pull. |
| `tasks` → Kanban boards/columns/cards in `/projects` | Title/description/format, normalized status, percentage, priority/tags, start/due, timezone, recurrence, parent/dependencies, checklist, remote assignees and staged attachments. Reuse `task-sync-contract.ts`, provider normalizers and aggregate services; retain additional source fields. |
| `calendar` → `events` in `/calendar` | UID, title/location/description, start/end, all-day flag, timezone, status, recurrence instance and attendees. Recurring occurrences need distinct remote IDs; a series UID alone is insufficient. |
| `contacts` → `contacts` in `/contacts` | Names, multiple typed emails/phones, company/job, addresses, notes and staged avatar. Preserve unknown vCard/native properties. Never merge across accounts based only on name or email. |

Local user, connector, account and materialized UUIDs come from the authenticated host, never the payload. The four schemas reject unrelated fields; staged references also require owner checks at materialization.

Civil dates use `{ "kind": "date", "date": "2026-10-01" }`; instants use `{ "kind": "date_time", "date_time": "2026-10-01T10:00:00+02:00" }`. Do not invent a UTC time for a date-only task. All-day event end dates are exclusive. Preserve TZID/timezone, DST and recurring exceptions before mapping to native timestamps.

Local iCalendar times use `{ "kind": "local_date_time", "date_time": "2026-10-25T02:30:00", "timezone": "Europe/Madrid" }`; a null timezone retains floating time. This is not an instant. The host must apply an explicit timezone/user policy and detect ambiguous or nonexistent DST times. If it cannot resolve them, retain/export the original and show the limitation before writing a timestamp.

### Existing implementation paths

- **Mail:** `gmail` and `microsoft-mail` use OAuth. `imap-generic` is created through `POST /email-accounts` with account-bound IMAP/SMTP and provider-specific password instructions. IMAP identity includes account/mailbox/UIDVALIDITY/UID; SMTP is an explicit send action.
- **Calendar:** `google-calendar`, `microsoft-calendar` and `caldav`. Select calendars before pull; CalDAV VEVENT collections and VTODO task lists are distinct. A partial/failed snapshot cannot authorize deletion.
- **Contacts:** `google-contacts`, `microsoft-contacts` and `carddav`. Respect contact groups/folders/address books, revisions and conditional writes; proxy avatars through an authorized host.
- **Tasks:** CalDAV VTODO, Todoist, Notion, Trello, Asana, ClickUp, monday.com, Jira, Google Tasks, Microsoft To Do and TickTick. Jira's current path uses email + API token with Basic; Trello needs API key + token. Field capability and the per-instance `write_enabled === true` gate are additional requirements for writes. Public creation cannot grant that opt-in.

Use `connector-types.ts` for the type, collection key and creation path; `provider-meta.ts` for accepted authentication; `oauthScopesFor()` for permissions; and `sync.service.ts` for the native factory. [Provider profiles](/sdk/provider-profiles/) link each native source implementation. Source availability is not a new real-account certification.

The recipe's `AuthorizedDomainSource` returns normalized records **before persistence**. Implement it with authorized provider APIs or protocol parsers. Do not wrap native `SyncConnector.pull()`: it already writes to the database and would materialize twice. Native connectors retain their existing path; SDK adapters persist through `MaterializationHost` and then publish hooks.

The composite CalDAV/CardDAV identities in the profiles are requirements for new SDK adapters. Native dedup currently uses user/protocol/UID and does not fully isolate connector/collection/recurring instance. That limitation is explicit in those profiles; reusing a parser does not certify its persistence identity strategy.

Certify account boundaries, selected collections, revisions/conflicts, MIME/attachments, recurrence/DST, multiple contact values and completed task handling. Provider capability does not imply that an operation is certified or enabled on a particular account.

## User interface

Keep the existing hierarchy:

```text
Connect
  1 Data type: nine existing tiles
  2 Source: provider, mode and limitations
  3 Access: choose an accepted method -> declared fields -> verify
  4 Selection: collections and limits -> start / back / cancel

Connection card: account, type, status, last run, selection, export, disconnect
```

Core supplies the catalog, authorization provider and scopes. Dash must not construct permissions from a provider name. OAuth carries the selected `connector_type` in authenticated state, validates the user and granted permissions, and checks popup origin, source and expected state. A connection becomes verified only after a real identity/access probe.

Use existing UI primitives and request clients. Cover loading, empty selection, cancellation, credential expiry, actionable errors and progress after reload. Show “Import” for one-off jobs and “Sync” only for a continuous supported path.

## Ownership and disconnection

Each materialized item has user, connector, remote ID, collection and revision provenance. Writeback and purge require an exact source link.

A local feed can have multiple source memberships. If OPML and Miniflux contain the same URL, removing one source must preserve the other subscription and local article/read/favorite state. Do not overwrite provenance with a single connector field.

Offer a working export before destructive source cleanup. Photos need original bytes, capture date and album attribution. File disconnection removes only local cache or converts it into an ordinary folder; it never deletes remote files. Music disconnection must not delete unrelated local Navidrome playlists.

OAuth supports gradual migration from legacy encrypted config to tenant-checked vault references. Migration verifies reciphering and preserves concurrent configuration changes; a source-local rollback retains the ciphertext and key. Never rotate a key as part of a connector rollout.

## Certification

Submit the manifest, factory, exact source revision, review record and tests. `ReviewedConnectorRegistry` requires these records and checks the factory's mode and methods. It is an explicit code registry, not an external installer.

The test suite covers schema and capability failures, OAuth policies and identities, egress, deadlines, pagination, checkpoint replay, cancellation, shared provenance, vault rollback and example adapters. Add a fixture database test and a real consumer UI test for the provider before setting a verification date or removing a domain's pending state.

Required cases include two users, two accounts of the same provider, multiple data types, selection boundaries, invalid/revoked credentials, 429, restart/resume, duplicate pages, export, conflicting edits and selective disconnection. Use a non-administrator test account; the workspace product fixture is Paco Trueno.

See [provider profiles](/sdk/provider-profiles/) and [channels and servers](/sdk/channels-and-servers/) for the other extension paths.

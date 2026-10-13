---
title: Data Provider Profiles
description: Authentication, producer APIs, local consumers and rollout conditions for all nine data domains.
---

<!-- Generated from core/src/sync/sdk/provider-profiles.ts. Regenerate with export-provider-profiles.ts. -->

These profiles define integrations for development. They are not the connectable provider catalog.

`existing` links to a native source implementation; `example` means an adapter can run against fixtures; `specified` means the producer contract is defined; `gated` means an API, authorization or policy condition remains. None is a new real-account certification or SDK registration.

See the [connector guide](/sdk/data-connectors/) for manifests, ownership and certification. Priorities combine broad use, an authorized API and consumer fit; they are not a comparable market-share ranking.

## Mail

### gmail

**Consumer:** `/mail` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Google OIDC sub plus Gmail message.id; retain RFC Message-ID separately.

**Collections:** Selected Gmail labels. Multiple labels can refer to the same message.

**Changes:** historyId + paginated history; expired history requires source-scoped resync.

**Materialization:** Owned email account -> emails, MIME bodies, folders/labels and authorized attachment proxy.

**Native connector:** `gmail` · Source: `core/src/sync/connectors/gmail.connector.ts`

- Existing source implementation is not a new real-account certification.
- Use existing email-account binding. Sending is a separate action, not a pull side effect.

[Official provider reference](https://developers.google.com/workspace/gmail/api/guides/sync).

### microsoft-mail

**Consumer:** `/mail` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Graph me.id plus message ID; explicitly handle Outlook IDs changing on moves.

**Collections:** Selected mail folders.

**Changes:** Folder delta nextLink/deltaLink, removed markers and bounded resync.

**Materialization:** Owned email account -> emails, MIME bodies, folders/labels and authorized attachment proxy.

**Native connector:** `microsoft-mail` · Source: `core/src/sync/connectors/microsoft-mail.connector.ts`

- Existing source implementation is not a new real-account certification.
- For new adapters, request ImmutableId consistently or keep an explicit move/ID mapping.
- No blind cross-origin nextLink with bearer credentials.

[Official provider reference](https://learn.microsoft.com/en-us/graph/outlook-immutable-id).

### imap-generic

**Consumer:** `/mail` · **Mode:** mirror · **Stage:** existing

**Authentication:** `app_password`, `basic`.

**Identity:** Authorized account + mailbox + UIDVALIDITY + UID; never UID alone.

**Collections:** Selected IMAP mailboxes; SMTP settings belong to the same owned account.

**Changes:** Per-folder UID markers, UIDVALIDITY reset, MIME bodies and flags.

**Materialization:** Owned email account -> emails, MIME bodies, folders/labels and authorized attachment proxy.

**Native connector:** `imap-generic` · Source: `core/src/sync/connectors/imap-generic.connector.ts`

- Existing source implementation is not a new real-account certification.
- Create through POST /email-accounts, not a second generic sync create path.
- Use the existing mail TLS/protocol host; the SDK JSON transport cannot speak IMAP or SMTP.

[Official provider reference](https://www.rfc-editor.org/rfc/rfc9051).

## Tasks

### caldav-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `app_password`, `basic`.

**Identity:** DAV principal + VTODO collection + UID and recurrence instance.

**Collections:** Selected VTODO task lists, independently of VEVENT calendars.

**Changes:** Collection marker/ETag, VTODO status/percentage/due/recurrence and conditional writes.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `caldav-tasks` · Source: `core/src/sync/connectors/caldav-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Do not materialize VTODO as a calendar event.
- Task writes additionally require the per-connector write_enabled gate.

[Official provider reference](https://www.rfc-editor.org/rfc/rfc4791).

### todoist-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `api_token`.

**Identity:** Verified Todoist account + project/item IDs.

**Collections:** Selected projects and sections.

**Changes:** API v1 Sync token; projects/sections/items including completion and explicit removals.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `todoist-tasks` · Source: `core/src/sync/connectors/todoist-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- REST active-task listings do not represent the complete task history.
- Map provider priority scales explicitly; no remote writes without the instance gate.

[Official provider reference](https://developer.todoist.com/api/v1/).

### notion-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `api_token`.

**Identity:** Integration/workspace + data_source/page IDs.

**Collections:** Explicitly shared data sources and property mapping.

**Changes:** Paginated queries and last_edited_time; status, people, date and relation mappings.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `notion-tasks` · Source: `core/src/sync/connectors/notion-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Read capabilities of properties differ from write capabilities.
- Retain unsupported blocks/properties and attachment expiry.

[Official provider reference](https://developers.notion.com/guides/get-started/authorization).

### trello-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `api_token`.

**Identity:** Verified member ID + board/list/card IDs.

**Collections:** Selected boards and remote lists.

**Changes:** Board/list/card enumeration; configured custom-field/checklist mapping.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `trello-tasks` · Source: `core/src/sync/connectors/http-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Current host requires API key plus user token, both scoped to the authenticated binding.

[Official provider reference](https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/).

### asana-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Asana users/me gid, workspace/project/task gids.

**Collections:** Selected projects and sections.

**Changes:** Paginated projects/sections/tasks and modified_at; completion and assigned-user mapping.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `asana-tasks` · Source: `core/src/sync/connectors/http-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Project membership and task identity are distinct; preserve multi-project membership.

[Official provider reference](https://developers.asana.com/docs/oauth).

### clickup-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `api_token`.

**Identity:** Verified user/team + space/folder/list/task IDs.

**Collections:** Selected lists under permitted workspaces.

**Changes:** Paginated list tasks and field mappings; explicit closed-task handling.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `clickup-tasks` · Source: `core/src/sync/connectors/http-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Preserve custom status and timezone/due semantics rather than guessing from labels.

[Official provider reference](https://developer.clickup.com/docs/authentication).

### monday-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `api_token`.

**Identity:** Verified account/user + board/item IDs.

**Collections:** Selected boards and explicit column mapping.

**Changes:** GraphQL item pages/cursor; status, date, people and relation column values.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `monday-tasks` · Source: `core/src/sync/connectors/http-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Rate/complexity limits and property mappings are part of the adapter contract.

[Official provider reference](https://developer.monday.com/api-reference/docs/authentication).

### jira-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `api_token`.

**Identity:** Configured Jira Cloud origin + accountId + project ID + immutable issue.id; key is display.

**Collections:** Selected projects, approved JQL and field mapping.

**Changes:** Paginated issue search, updated/version and workflow transition map.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `jira-tasks` · Source: `core/src/sync/connectors/http-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Current create requires server_url, email and API token; email+token use Basic, not an account password.
- Jira issue dates do not make this a calendar connector; derived calendar data needs a separate contract.

[Official provider reference](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/).

### google-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Google sub + task list/task IDs.

**Collections:** Selected Google task lists.

**Changes:** Paginated task lists/tasks; explicit completed/hidden task handling.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `google-tasks` · Source: `core/src/sync/connectors/http-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Google Tasks due date semantics must not invent a due time.
- Expose field capabilities and the per-instance write gate.

[Official provider reference](https://developers.google.com/workspace/tasks/reference/rest).

### microsoft-todo

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Graph me.id + todoTaskList/todoTask IDs.

**Collections:** Selected To Do lists.

**Changes:** List/task pagination; body, status, checklist, reminders and recurrence mapping.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `microsoft-todo` · Source: `core/src/sync/connectors/http-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Preserve provider timezone and date/time distinction.

[Official provider reference](https://learn.microsoft.com/en-us/graph/api/resources/todo-overview?view=graph-rest-1.0).

### ticktick-tasks

**Consumer:** `/projects` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Stable account probe unverified; current OAuth host uses an isolated authorization instance. Project/task IDs are source scoped.

**Collections:** Selected projects.

**Changes:** Open API project data and explicit task completion/write capabilities.

**Materialization:** kanban_boards/columns/cards with connector_id and remote list/task identity; task aggregate and post-CRUD hooks.

**Native connector:** `ticktick-tasks` · Source: `core/src/sync/connectors/http-tasks.connector.ts`

- Existing source implementation is not a new real-account certification.
- Do not claim stable-account SDK certification or automatic account merging.
- Completion/reopen semantics must follow the current provider capability map.

[Official provider reference](https://developer.ticktick.com/docs#/openapi).

## Calendar

### google-calendar

**Consumer:** `/calendar` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Google sub + calendar.id + event.id; retain iCalUID and recurring-instance identity.

**Collections:** Selected calendars.

**Changes:** Page tokens then syncToken; 410 means resync only this source/calendar.

**Materialization:** events with connector_id, calendar identity, civil dates/timezone, recurrence and attendees.

**Native connector:** `google-calendar` · Source: `core/src/sync/connectors/google-calendar.connector.ts`

- Existing source implementation is not a new real-account certification.
- Date-only values remain all-day dates; recurring exceptions must not collapse into their series.

[Official provider reference](https://developers.google.com/workspace/calendar/api/guides/sync).

### microsoft-calendar

**Consumer:** `/calendar` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Graph me.id + calendar.id + event ID with declared move/immutable-ID policy.

**Collections:** Selected calendars and authorized calendar view.

**Changes:** Paginated calendar-view delta with the same query/time window.

**Materialization:** events with connector_id, calendar identity, civil dates/timezone, recurrence and attendees.

**Native connector:** `microsoft-calendar` · Source: `core/src/sync/connectors/microsoft-calendar.connector.ts`

- Existing source implementation is not a new real-account certification.
- Preserve Windows/IANA timezone mapping and series/occurrence exceptions.
- A delta for a limited time window cannot prove deletion outside that window.

[Official provider reference](https://learn.microsoft.com/en-us/graph/api/event-delta?view=graph-rest-1.0).

### caldav

**Consumer:** `/calendar` · **Mode:** mirror · **Stage:** existing

**Authentication:** `app_password`, `basic`.

**Identity:** Verified DAV principal/origin + calendar href + UID + RECURRENCE-ID.

**Collections:** Selected VEVENT calendars; tasks use a separate connector.

**Changes:** Calendar ctag/ETag; conditional PUT and completed collection snapshots before pruning.

**Materialization:** events with connector_id, calendar identity, civil dates/timezone, recurrence and attendees.

**Native connector:** `caldav` · Source: `core/src/sync/connectors/caldav-generic.connector.ts`

- Existing source implementation is not a new real-account certification.
- Identity above is required for a new SDK adapter. Native dedup currently uses user/source/UID and does not fully isolate calendar/connector/recurring instance.
- Retain original iCalendar recurrence/timezone fields and remote href.
- Never let a partial or failed collection scan delete unobserved events.

[Official provider reference](https://www.rfc-editor.org/rfc/rfc4791).

## Contacts

### google-contacts

**Consumer:** `/contacts` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Google sub + People resourceName and etag; not the contact email address.

**Collections:** Selected contact groups/address-book scope.

**Changes:** People pagination and syncToken; deletion metadata and resource etag.

**Materialization:** contacts with connector_id, address book, multiple emails/phones, retained vCard/native fields.

**Native connector:** `google-contacts` · Source: `core/src/sync/connectors/google-contacts.connector.ts`

- Existing source implementation is not a new real-account certification.
- A contact in two groups stays one provider identity.
- Mutations require the supported etag/mask and source ownership.

[Official provider reference](https://developers.google.com/people/v1/contacts).

### microsoft-contacts

**Consumer:** `/contacts` · **Mode:** mirror · **Stage:** existing

**Authentication:** `oauth2`.

**Identity:** Graph me.id + contact folder + contact ID; declare move/immutable-ID handling.

**Collections:** Selected contact folders.

**Changes:** Per-folder delta nextLink/deltaLink and removed entries.

**Materialization:** contacts with connector_id, address book, multiple emails/phones, retained vCard/native fields.

**Native connector:** `microsoft-contacts` · Source: `core/src/sync/connectors/microsoft-contacts.connector.ts`

- Existing source implementation is not a new real-account certification.
- Multiple emails/phones remain structured; no merge based only on display name.

[Official provider reference](https://learn.microsoft.com/en-us/graph/api/contact-delta?view=graph-rest-1.0).

### carddav

**Consumer:** `/contacts` · **Mode:** mirror · **Stage:** existing

**Authentication:** `app_password`, `basic`.

**Identity:** Verified DAV principal/origin + address-book href + vCard UID; retain href/ETag.

**Collections:** Selected CardDAV address books.

**Changes:** Address-book marker/ETag; vCard parsing and source-scoped snapshots.

**Materialization:** contacts with connector_id, address book, multiple emails/phones, retained vCard/native fields.

**Native connector:** `carddav` · Source: `core/src/sync/connectors/carddav-generic.connector.ts`

- Existing source implementation is not a new real-account certification.
- Identity above is required for a new SDK adapter. Native dedup currently uses user/source/UID and does not fully isolate address book/connector.
- Retain unknown vCard properties for lossless export.
- Photos use authorized staging/proxy; no browser access to credential-bearing URLs.

[Official provider reference](https://www.rfc-editor.org/rfc/rfc6352).

## Notes

### markdown-folder

**Consumer:** `/notes` · **Mode:** import · **Stage:** example

**Authentication:** `local_folder`.

**Identity:** Granted root ID plus user ID; relative file path for note ID.

**Collections:** Selected folders under the granted root.

**Changes:** One-off job, checkpointed pages, SHA-256 revision. No scheduler.

**Materialization:** Markdown content, title, references, source link per file.

- No Obsidian/Logseq plugin execution.
- No automatic remote API for a local notes application.

[Official provider reference](https://help.obsidian.md/Files+and+folders/Manage+notes).

### nextcloud-notes

**Consumer:** `/notes` · **Mode:** mirror · **Stage:** example

**Authentication:** `app_password`, `basic`.

**Identity:** OCS cloud/user id, bound to the configured Nextcloud origin.

**Collections:** Notes categories; explicit uncategorized collection.

**Changes:** Notes API v1 full snapshot; note id + etag/modified. No deletion inferred from a partial page.

**Materialization:** Markdown note with connector/remote/category/revision provenance.

- Read-only until edit fidelity is certified.
- Referenced attachments need separate authorization/download handling.

[Official provider reference](https://github.com/nextcloud/notes/blob/main/docs/api/README.md).

### notion-notes

**Consumer:** `/notes` · **Mode:** mirror · **Stage:** specified

**Authentication:** `api_token`, `oauth2`.

**Identity:** Workspace and bot/user IDs from the authorized integration.

**Collections:** Explicitly shared pages/data sources; never the entire workspace by assumption.

**Changes:** Paginated block trees and last_edited_time; retain unsupported blocks.

**Materialization:** Native blocks/format + readable representation + attachment URLs with expiry; lossless export before writes.

- Markdown cannot represent every Notion block.
- Public OAuth and internal token are separate authorization methods.

[Official provider reference](https://developers.notion.com/guides/get-started/authorization).

### onenote-notes

**Consumer:** `/notes` · **Mode:** mirror · **Stage:** specified

**Authentication:** `oauth2`.

**Identity:** Microsoft Graph me.id; delegated user access.

**Collections:** Notebook / section / page.

**Changes:** Graph pagination, page modified timestamp; keep source HTML and resources.

**Materialization:** HTML note and separately authorized attachments.

- No app-only authorization.
- Remote edits require HTML/resource fidelity certification.

[Official provider reference](https://learn.microsoft.com/en-us/graph/api/resources/onenote-api-overview?view=graph-rest-1.0).

## Files

### gdrive-files

**Consumer:** `/explorer` · **Mode:** mounted · **Stage:** specified

**Authentication:** `oauth2`.

**Identity:** Google sub and Drive file.id, not path.

**Collections:** Explicit selected folders/drives; drive.file has selection-dependent visibility.

**Changes:** Changes startPageToken and paginated changes; file version/etag.

**Materialization:** VFS mount; persistent used-content cache keyed by user/mount/remote id/revision.

- Reuse gdrive VFS; Connect certification still needed.
- Native Google documents require an explicit export MIME type.
- Write conflicts keep both copies; disconnect never deletes remote content.

[Official provider reference](https://developers.google.com/workspace/drive/api/guides/manage-changes).

### dropbox-files

**Consumer:** `/explorer` · **Mode:** mounted · **Stage:** specified

**Authentication:** `oauth2`.

**Identity:** Dropbox account_id and file id/rev.

**Collections:** Selected folders in App Folder or Full Dropbox scope.

**Changes:** files/list_folder cursor and continue; rev-aware upload.

**Materialization:** Existing dropbox VFS with per-source durable cache and conflict copies.

- App Folder does not grant access to the entire account.
- Remote delete only through an explicit file action, never disconnect.

[Official provider reference](https://developers.dropbox.com/oauth-guide).

### onedrive-files

**Consumer:** `/explorer` · **Mode:** mounted · **Stage:** specified

**Authentication:** `oauth2`.

**Identity:** Graph me.id + drive.id + driveItem.id.

**Collections:** Selected folders and permitted drives.

**Changes:** nextLink pages then deltaLink; deleted facet; last occurrence of an item wins.

**Materialization:** VFS source; conditional writes using remote revision; preserved conflict copy.

- Moves change paths, not remote identity.
- Do not follow arbitrary nextLink hosts with bearer credentials.

[Official provider reference](https://learn.microsoft.com/en-us/graph/api/driveitem-delta?view=graph-rest-1.0).

### nextcloud-files

**Consumer:** `/explorer` · **Mode:** mounted · **Stage:** specified

**Authentication:** `app_password`, `basic`.

**Identity:** OCS user id + WebDAV fileid when available; normalized path fallback explicitly declared.

**Collections:** Selected WebDAV directories under user root.

**Changes:** PROPFIND/ETag; conditional PUT and MOVE/COPY/DELETE with ownership and path guards.

**Materialization:** Mounted source and durable content cache, not ordinary local files by default.

- LAN allowed only for an explicitly entered origin; no automatic trust of redirects.
- SMB/NFS sharing requires a separately authorized local cache view.

[Official provider reference](https://docs.nextcloud.com/server/stable/developer_manual/client_apis/WebDAV/index.html).

### s3-sftp-files

**Consumer:** `/explorer` · **Mode:** mounted · **Stage:** gated

**Authentication:** `s3_key`, `ssh_key`, `basic`.

**Identity:** Scoped endpoint/bucket or SSH host key + account; remote object key/version.

**Collections:** Allowed bucket prefixes or SFTP root.

**Changes:** Provider-specific listing and conditional writes; S3 ETag is not always a content hash.

**Materialization:** VFS with quotas and explicit credential/host-key policy.

- Separate adapters; no generic DAV fallback.
- Requires review of host-key pinning, prefix permissions and write semantics.

[Official provider reference](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html).

## Photos

### immich-photos

**Consumer:** `/photos` · **Mode:** mirror · **Stage:** specified

**Authentication:** `api_token`.

**Identity:** Immich user id from users/me; asset.id and album.id.

**Collections:** Selected albums/assets permitted by user API key.

**Changes:** Version-pinned Immich API; paginated search/assets, checksum and updatedAt.

**Materialization:** Original bytes under /Photos; hash dedup, album membership and capture date independent of import time.

- Originals, metadata and album export must work before source purge.
- Reuse files hooks for thumbnails/search; no duplicate media pipeline.

[Official provider reference](https://docs.immich.app/api/).

### google-photos-picker

**Consumer:** `/photos` · **Mode:** import · **Stage:** gated

**Authentication:** `oauth2`.

**Identity:** Google sub + picker session id + selected media id.

**Collections:** Only assets the user selects in an expiring Picker session.

**Changes:** Cancelable import job. No background scan of the Google Photos library.

**Materialization:** Selected originals only after permitted-use review; provenance records session and media ID.

- Policy gate: general replacement gallery and face clustering prohibited.
- No registration/activation while the Micelclaw use case remains unapproved.

[Official provider reference](https://developers.google.com/photos/support/api-policy).

### synology-photos

**Consumer:** `/photos` · **Mode:** mirror · **Stage:** gated

**Authentication:** `app_password`, `basic`.

**Identity:** DSM account/session and asset IDs; contract must be verified for each supported DSM version.

**Collections:** Albums and spaces with account permissions.

**Changes:** Requires documented stable API and compatibility fixtures.

**Materialization:** Same original/date/hash/album consumer contract as Immich.

- Do not register an undocumented private endpoint as a supported integration.

[Official provider reference](https://www.synology.com/en-global/dsm/feature/photos).

## Music

### spotify-music

**Consumer:** `/music` · **Mode:** mirror · **Stage:** specified

**Authentication:** `oauth2`.

**Identity:** Spotify me.id; playlist.id/track.id with snapshot_id and item order.

**Collections:** Saved tracks and selected authorized playlists.

**Changes:** Paginated playlist items/library; OAuth user-library-read and playlist-read-private/collaborative only when used.

**Materialization:** External playlists/track references with source URL and local matching state; preserve unmatched items.

- No audio byte import; no automatic Navidrome playlist mutation.
- Development quota and application review gate public distribution.
- Spotify IDs never serve as Navidrome song IDs.

[Official provider reference](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).

### opensubsonic-music

**Consumer:** `/music` · **Mode:** mirror · **Stage:** specified

**Authentication:** `app_password`, `basic`.

**Identity:** Origin and verified server account; playlist.id/song.id scoped to that server.

**Collections:** Selected playlists, starred/library metadata.

**Changes:** getPlaylists/getPlaylist pagination where supported; token + salt authentication over TLS.

**Materialization:** External references first; local Navidrome IDs only from an explicit match.

- Password-derived token/salt is authentication material and must not be logged.
- Do not auto-start a server or transfer media rights from a playlist.

[Official provider reference](https://opensubsonic.netlify.app/docs/endpoints/getplaylists/).

### apple-music

**Consumer:** `/music` · **Mode:** mirror · **Stage:** specified

**Authentication:** `api_token`.

**Identity:** Apple authorized user context; library IDs remain distinct from catalog IDs.

**Collections:** Authorized library playlists.

**Changes:** Apple Music API pagination; developer token plus Music User Token.

**Materialization:** Ordered metadata references with match state, no media import.

- Two different credential roles; never model Music User Token as developer token.
- Separate authorization and regional catalog tests required.

[Official provider reference](https://developer.apple.com/documentation/applemusicapi/get-all-library-playlists).

## Feeds

### opml-feeds

**Consumer:** `/feeds` · **Mode:** import · **Stage:** example

**Authentication:** `none`.

**Identity:** Persisted import/source id + canonical feed URL.

**Collections:** OPML outline categories and explicitly selected subscriptions.

**Changes:** Bounded XML parse with DTD/external entities disabled; resumable/cancelable job.

**Materialization:** One live feed per user/URL, multiple source memberships; preserve local articles/read/favorite state.

- Imports subscriptions, not Feedly Boards, AI feeds or Read Later.
- No scheduled OPML polling; reuse existing import/export during migration.

[Official provider reference](https://docs.feedly.com/article/52-how-can-i-export-my-sources-and-feeds-through-opml).

### miniflux-feeds

**Consumer:** `/feeds` · **Mode:** mirror · **Stage:** example

**Authentication:** `api_token`, `basic`.

**Identity:** v1/me id scoped to Miniflux origin.

**Collections:** v1/categories and category-owned feeds.

**Changes:** v1/feeds subscriptions with stable remote id; full snapshot. Local polling gets articles.

**Materialization:** Feed URL canonical dedup + connector membership; subscription metadata only.

- Read state sync disabled unless separately certified.
- Removing one source must preserve membership from OPML or another connector.

[Official provider reference](https://miniflux.app/docs/api.html).

### freshrss-feeds

**Consumer:** `/feeds` · **Mode:** mirror · **Stage:** specified

**Authentication:** `app_password`, `basic`.

**Identity:** Verified Google Reader API user context and origin.

**Collections:** Subscriptions/labels from the enabled FreshRSS API.

**Changes:** GoogleReader subscription/list; API login authorization; bounded pages for streams only if implemented.

**Materialization:** Subscriptions and categories with source links.

- API password may differ from the login password.
- Do not claim Google OAuth because the API is named GoogleReader.

[Official provider reference](https://freshrss.github.io/FreshRSS/en/developers/06_GoogleReader_API.html).

### nextcloud-news

**Consumer:** `/feeds` · **Mode:** mirror · **Stage:** specified

**Authentication:** `app_password`, `basic`.

**Identity:** OCS user id and News feed.id, bound to origin.

**Collections:** News folders/feeds.

**Changes:** Stable News API v1-2; v2 draft is not a supported production contract.

**Materialization:** Subscriptions initially; remote read/favorite state gated separately.

- App password required when account uses 2FA.
- Local reading state remains authoritative until explicit remote state policy.

[Official provider reference](https://github.com/nextcloud/news/blob/master/docs/api/api-v1-2.md).

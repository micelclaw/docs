---
title: Channels and MCP Servers
description: Extension points, interface expectations, permissions and security for messaging channels and tool servers.
---

Choose the extension path that matches the consumer:

| Extension | Consumer | Source of truth |
| --- | --- | --- |
| Data connector | Notes, files, photos, music, feeds or the four existing data domains | [Data connector SDK](/sdk/data-connectors/) |
| Messaging channel | Messages and Gateway | `core/src/services/messages/platform-meta.ts` and the messaging playbook |
| MCP server | Agent tools through the Core broker | `core/src/services/mcp-broker.service.ts` and MCP connection routes |

A data adapter does not install an OpenClaw channel or grant agent tools. Tool discovery does not import data into a module or authorize a tool call.

## Contribute a messaging channel

Declare the real transport in `PlatformMeta`: a native Core observer, a Gateway channel or a Matrix bridge. Unsupported providers remain explicitly unavailable. Include platform identity, connector/channel type, pairing method, stream or polling behavior and implemented capabilities: backfill, read receipts and media.

A native observer implements the existing `SyncConnector` contract under `core/src/sync/connectors/`. Gateway channels use `gateway-observer` and the existing `claw-messages-bridge`, scoped by channel/account identity. Keep one source of truth for each channel.

```text
Messaging / new account
  Platform and available transport
  Access: OAuth / token / QR / code / webhook
  Select chats, own messages or all, content or metadata
  Card: verify / reconnect / revoke this account
```

Persist chat selection and privacy filters before backfill or streaming. Derive the local owner from an authenticated binding, never a webhook's claimed `user_id`. A message's deduplication key must distinguish service, account, chat and remote message ID. Verify webhook signatures and replay windows; enforce payload size and rate bounds.

Observing and sending are separate capabilities. Advertise receipts only if the provider supplies them. Proxy authorized attachments with MIME and size checks. Reconnection uses bounded backoff and checkpoints; revoking one account must not affect other accounts.

Use the existing Gateway RPC `config.patch` boundary. Do not edit `openclaw.json` or spawn the CLI for ordinary configuration. A new sidecar requires a separate infrastructure decision.

Certification covers invalid/revoked pairing, two users/accounts/chats, selection boundaries, replay, reconnect, privacy filters, attachments and sending when implemented. Update both the platform catalog and Dash consumer through the messaging playbook.

The executable recipe in `core/src/sync/sdk/examples/native-channel.ts` implements `SyncConnector`, checks account identity, freezes consent, filters selected chats/own messages, removes content in metadata mode and deduplicates before a host commit. It does not implement pairing, provider transport or production persistence. The host must commit messages and checkpoint atomically, check ownership and emit hooks after commit.

For Gateway plugins, use the [official OpenClaw manifest reference](https://docs.openclaw.ai/plugins/manifest) together with the API of the version installed in your checkout. Current online documentation does not prove that an export exists in the deployed version.

## Integrate an MCP server

Implement the MCP protocol with an official SDK, and document supported protocol/transport versions. Micelclaw connects through its broker; a server is not arbitrary code loaded into Core.

The current broker uses **Streamable HTTP**. A stdio-only server needs a compatible HTTP deployment before connecting by URL. Start with the [official MCP server development guide](https://modelcontextprotocol.io/docs/develop/build-server).

The executable factory `core/src/sync/sdk/examples/mcp-server.ts` registers `acme_search` with validated input/output, at most 20 record references, cancellation and safe error responses. Tests negotiate with the official client over an in-memory transport. The inspected checkout uses MCP SDK `1.29.0` and Zod 4; the factory adds no dependency and opens no port.

To serve it over HTTP, authenticate before creating the account-bound search capability; enforce body/rate limits and Host/Origin checks. Connect the factory to `StreamableHTTPServerTransport` and call `handleRequest` for the authenticated request. Use an instance per authenticated session, or per request in stateless mode; never share one account's capability across users. HTTPS deployment and broker/grant certification remain separate steps.

Current Core routes use the `/api/v1` prefix:

| Route | Purpose |
| --- | --- |
| `GET /mcp-connections/templates` | Product templates |
| `GET /mcp-connections` | Connections visible to the current user |
| `POST /mcp-connections` | Create an authorized personal/shared connection |
| `POST /mcp-connections/:id/test` | Probe and discover tools |
| `POST /mcp-connections/:id/grants` | Grant selected access to an agent |
| `POST /mcp-connections/:id/user-grant` | Grant user access to a shared connection before granting agent access |
| `DELETE /mcp-connections/:id/user-grant` | Revoke user access |
| `DELETE /mcp-connections/:id/grants/:agentId` | Revoke agent access |
| `DELETE /mcp-connections/:id` | Remove the authorized connection |

A custom personal connection accepts `display_name`, `owner_type: "personal"`, an HTTPS `url` and an optional `bearer_token`. Product templates use `template_id`. An agent grant sends `{ "agent_id": "<uuid>", "tool_filter": ["acme_search"] }`. **An empty or omitted `tool_filter` grants all tools**, not zero tools. Send an explicit list for limited access. Shared connections require the user grant through `/user-grant` before an agent grant. Personal endpoints require public HTTPS; localhost and private networks are blocked. Shared connections require owner/admin authorization. Do not carry the data-connector LAN policy into the MCP broker.

```text
Tools / servers
  Personal or shared -> template or HTTPS URL -> credential
  Test -> connection status and discovered tools
  Agent -> select tools and permissions -> grant
  Revoke grant / disconnect
```

Provide stable tool names, input/output schemas, clear errors, pagination, cancellation and bounds. Describe effects explicitly: read, write, delete, send, execute or spend. Remote annotations are untrusted; discovered tools still need effective grants on each call.

Use `snake_case` REST fields, `{data: ...}` responses and `{error: {code, message, details}}` errors. Keep credentials and OAuth/header state out of public responses. Test ungranted calls, unselected tools, other users, revocation, unsafe endpoints and malformed/oversized responses.

## Deliverable

Submit reviewed source, credential-free fixtures, setup/revocation instructions, truthful capability metadata, UI states and actual test results. Dynamic package installation, signing and sandbox distribution require a separately designed trust boundary; they are not enabled by this SDK.

---
title: "DNS"
description: "DNS zone and record management, templates, provider accounts, DDNS, and NS verification."
---

Base path: `/api/v1/dns`

The DNS module lets you manage DNS zones, records, and dynamic DNS. Supports both authoritative mode (self-hosted DNS via PowerDNS) and proxy mode (managing records via external providers like Cloudflare).

## Zones

### List zones

`GET /dns/zones`

Returns all DNS zones for the current user.

**Response fields per zone:**

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Zone identifier |
| `zone` | string | Domain name (e.g., `example.com`) |
| `mode` | string | `authoritative` or `proxy` |
| `provider_account_id` | UUID? | Associated provider (proxy mode) |
| `ns_verified` | boolean | NS delegation verified |
| `ddns_enabled` | boolean | Dynamic DNS enabled |
| `records_count` | integer | Number of DNS records |

### Get zone

`GET /dns/zones/:id`

### Create zone

`POST /dns/zones`

**Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `zone` | string | Yes | Domain name |
| `mode` | string | Yes | `authoritative` or `proxy` |
| `provider_account_id` | UUID | Proxy mode only | Required for proxy mode |

**Authoritative mode:** Creates the zone in the built-in DNS server, opens port 53 if needed, and starts NS verification polling.

**Proxy mode:** Validates the provider account and imports the zone from the external provider.

### Delete zone

`DELETE /dns/zones/:id`

In authoritative mode, removes the zone from the DNS server and closes port 53 if no other authoritative zones remain.

### Sync zone

`POST /dns/zones/:id/sync`

Re-syncs zone data from the external provider. Proxy mode only.

### Configure DDNS

`PATCH /dns/zones/:id/ddns`

**Body:** `{ "ddns_enabled": true, "ddns_record_ids": ["record-id-1", "record-id-2"] }`

## Records

### List records

`GET /dns/zones/:id/records`

Returns all DNS records for a zone. Delegates to the appropriate provider.

**Response fields per record:**

| Field | Type | Description |
|---|---|---|
| `id` | string | Record identifier |
| `type` | string | `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `SRV`, `CAA`, `NS` |
| `name` | string | Record name (e.g., `mail.example.com`) |
| `content` | string | Record value |
| `ttl` | integer | Time to live (1–86400) |
| `priority` | integer? | Required for `MX` and `SRV` |
| `proxied` | boolean | Cloudflare proxy enabled |

### Create record

`POST /dns/zones/:id/records`

**Body:** `{ "type": "A", "name": "www.example.com", "content": "1.2.3.4", "ttl": 3600, "proxied": false }`

**Validation by type:**
- `A` — valid IPv4
- `AAAA` — valid IPv6
- `CNAME`, `NS` — valid hostname
- `MX` — hostname + priority (0–65535) required
- `SRV` — priority required
- `CAA` — format `"flags tag value"` (e.g., `"0 issue letsencrypt.org"`)
- `TXT` — any content

### Update record

`PUT /dns/zones/:id/records/:recordId`

### Delete record

`DELETE /dns/zones/:id/records/:recordId`

## Templates

### List templates

`GET /dns/templates`

Returns available DNS record templates.

**Available templates:** `mail-full`, `mail-mx-only`, `expose-service`, `caa-letsencrypt`, `verify-google`, `verify-microsoft`.

Each template includes `required_variables` and a `records` array with placeholder patterns.

### Apply template

`POST /dns/zones/:id/apply-template`

**Body:**

```json
{
  "template": "mail-full",
  "variables": {
    "domain": "example.com",
    "server_ip": "1.2.3.4",
    "dkim_key": "MIIBIjANBg..."
  }
}
```

**Response:** Array of created records.

## Provider accounts

### List providers

`GET /dns/provider-accounts`

### Connect provider

`POST /dns/provider-accounts`

**Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `provider` | string | Yes | `cloudflare`, `porkbun`, `namecheap`, or `hetzner` |
| `label` | string | Yes | Display name |
| `credentials` | object | Yes | Provider-specific credentials |

**Credentials by provider:**
- **Cloudflare:** `{ "api_token": "..." }`
- **Porkbun:** `{ "apikey": "...", "secretapikey": "..." }`
- **Namecheap:** `{ "api_user": "...", "api_key": "...", "client_ip": "..." }`
- **Hetzner:** `{ "api_token": "..." }`

All credentials are encrypted with AES-256-GCM before storage.

### Test connection

`POST /dns/provider-accounts/:id/test`

**Response:** `{ "connected": true }`

### Delete provider

`DELETE /dns/provider-accounts/:id`

## NS verification

`POST /dns/zones/:id/verify-ns`

Verifies NS delegation for an authoritative zone.

**Response fields:**

| Field | Type | Description |
|---|---|---|
| `verified` | boolean | Whether NS delegation is confirmed |
| `ns_found` | string[] | Nameservers found |
| `expected_ip` | string | Expected server IP |
| `propagation_status` | string | `pending`, `verified`, or `failed` |

## DDNS

`GET /dns/ddns/status` — Current DDNS status

`GET /dns/ddns/log?limit=50` — IP change history with updated zones

`POST /dns/ddns/check-now` — Force immediate IP check

## Network diagnostics

`GET /dns/network/public-ip` — Returns `{ "ip": "1.2.3.4" }`

`GET /dns/network/port53-check` — Checks port 53 accessibility from internet (UDP + TCP)

`GET /dns/network/ip-type` — Detects if public IP is `static`, `dynamic`, or `unknown` (based on 30-day DDNS history)

## Micelclaw subdomain

`GET /dns/micelclaw-subdomain`

Returns the user's `*.micelclaw.com` subdomain status, including `subdomain`, `instance_ip`, `active`, and expiry.

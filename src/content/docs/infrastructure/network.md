---
title: "Network & Proxy"
description: "Network interfaces, reverse proxy configuration, SSL, Cloudflare integration, and VPN management."
---

Base path: `/api/v1/network`, `/api/v1/hal/network`

The Network API covers network interfaces, reverse proxy management (Caddy), SSL certificates, Cloudflare DNS integration, and VPN configuration.

## Network interfaces

`GET /network/interfaces`

Lists all network interfaces with IP addresses, status, and type.

`GET /network/connectivity`

Checks internet connectivity and returns latency information.

## Reverse proxy

The built-in reverse proxy (Caddy) handles routing external traffic to internal services with automatic HTTPS.

### List routes

`GET /hal/network/proxy/routes`

Returns all configured proxy routes.

**Response:** Array of route objects with `domain`, `target`, `ssl`, `enabled` fields.

### Add route

`POST /hal/network/proxy/routes`

**Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `domain` | string | Yes | External domain (e.g., `notes.example.com`) |
| `target` | string | Yes | Internal target (e.g., `http://localhost:7200`) |
| `ssl` | boolean | No | Enable HTTPS with automatic ACME certificate |

### Update route

`PUT /hal/network/proxy/routes/:id`

### Delete route

`DELETE /hal/network/proxy/routes/:id`

## SSL

`GET /hal/network/ssl/status`

Returns SSL certificate status for all configured domains, including issuer, expiry, and auto-renewal status.

`GET /hal/network/ssl/ca`

Downloads the CA certificate for local trust (useful for self-signed setups).

## Cloudflare integration

### DNS proxy

`GET /proxy/cloudflare/config` — Current Cloudflare configuration

`PUT /proxy/cloudflare/config` — Update Cloudflare API token

`GET /proxy/cloudflare/dns` — List DNS records via Cloudflare

### Subdomain requests

`GET /proxy/subdomain` — Current subdomain status

`POST /proxy/subdomain` — Request a `*.micelclaw.com` subdomain (Pro)

## Tailscale VPN

| Endpoint | Method | Description |
|---|---|---|
| `/hal/network/tailscale/status` | GET | Tailscale connection status |
| `/hal/network/tailscale/install` | POST | Install Tailscale |
| `/hal/network/tailscale/login` | POST | Authenticate with Tailscale |
| `/hal/network/tailscale/logout` | POST | Disconnect from Tailscale |
| `/hal/network/tailscale/generate-cert` | POST | Generate HTTPS cert for Tailscale hostname |

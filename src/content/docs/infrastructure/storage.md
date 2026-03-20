---
title: "Storage (HAL)"
description: "Hardware abstraction layer for disk management, volumes, SMART monitoring, and data usage."
---

Base path: `/api/v1/hal/storage`

The Storage API exposes disk and volume information through a hardware abstraction layer. It works on any Linux system with a basic provider, and supports advanced features (RAID, shares) when OpenMediaVault is installed.

## Status

`GET /hal/storage/status`

Returns overall storage status.

**Response fields:**

| Field | Type | Description |
|---|---|---|
| `provider` | string | `linux-basic` or `omv` |
| `total_bytes` | integer | Total storage capacity |
| `used_bytes` | integer | Used storage |
| `free_bytes` | integer | Free storage |
| `health` | string | `healthy`, `warning`, `critical`, or `unknown` |

:::note
`health: "unknown"` is normal in WSL2 or VM environments where SMART data is unavailable.
:::

## Capabilities

`GET /hal/storage/capabilities`

Returns what the current storage provider supports.

**Response fields:**

| Field | Type | Description |
|---|---|---|
| `provider` | string | Current provider name |
| `capabilities` | object | Boolean flags for each capability |
| `missing_for_full` | string? | `"openmediavault"` or `null` |

Capabilities include: `canListDisks`, `canListVolumes`, `canGetUsage`, `canGetDataUsage`, `canGetSmart`, `canCreatePool`, `canManageShares`, and more.

## Disks

`GET /hal/storage/disks`

Lists physical disks with model, serial, size, type, temperature, and SMART status. Cached for 5 minutes.

**Response:** Array of disk objects with `partitions` array.

## SMART data

`GET /hal/storage/disks/:id/smart`

Returns SMART health data for a specific disk. The `:id` parameter uses format `disk_[a-z0-9]+`.

**Response fields:**

| Field | Type | Description |
|---|---|---|
| `disk_id` | string | Disk identifier |
| `overall_status` | string | `healthy`, `warning`, or `critical` |
| `power_on_hours` | integer | Total hours powered on |
| `temperature_c` | integer | Current temperature |
| `reallocated_sectors` | integer | Count of reallocated sectors |
| `attributes` | object[] | Full SMART attribute table |

Returns `null` if SMART is unavailable for the disk. Cached for 30 minutes.

## Volumes

`GET /hal/storage/volumes`

Lists mounted volumes. Automatically filters virtual filesystems (tmpfs, devtmpfs, etc.).

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `include_windows` | boolean | `false` | Include Windows drives in WSL2 |

**Response:** Array of volume objects with `mount_point`, `filesystem`, `size_bytes`, `used_bytes`, `free_bytes`, and `status`.

## Data usage by category

`GET /hal/storage/data-usage`

Breaks down storage usage by data category. Cached for 5 minutes.

**Categories:** `files`, `photos`, `attachments`, `models` (AI models), `media`, `crypto` (blockchain), `backups`, `database`.

Each category includes `name`, `label`, `size_bytes`, and `status` (`ok` or `timeout` if calculation exceeds 30s).

## RAID pools

`GET /hal/storage/pools` — List RAID pools (empty with `linux-basic` provider)

`POST /hal/storage/pools` — Create RAID pool (requires OMV)

**Body:** `{ "name": "...", "type": "raid0|raid1|raid5|raid6|raid10", "diskIds": ["disk_sdc", "disk_sdd"] }`

## Re-detect provider

`POST /hal/storage/detect-provider`

Re-detects the storage provider (e.g., after installing OpenMediaVault). Requires admin role. Invalidates all cache.

**Response:** `{ "previous": "linux-basic", "current": "omv", "changed": true }`

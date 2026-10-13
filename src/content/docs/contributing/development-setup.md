---
title: Development Setup
description: Set up your local development environment for contributing to Micelclaw OS.
---

This guide covers cloning the repo, installing dependencies, running the dev server, and connecting to a local PostgreSQL instance.

:::note
This page is under construction. Full content coming soon.
:::

## Connector development

For a reviewed integration, start with the [data connector SDK](/sdk/data-connectors/), its executable fixtures and provider profiles. For messaging or agent tools, use the [channels and MCP servers guide](/sdk/channels-and-servers/). These guides describe the supported contribution boundaries; they do not install arbitrary packages into Core.

The SDK fixture suite was verified with **Node 22.23.1 and pnpm 9.15.4**. The repository pins pnpm 9.15.4. From the root of an authorized Micelclaw OS development checkout:

```sh
pnpm install --frozen-lockfile
pnpm -C core sdk:connector acme-notes notes
pnpm -C core test:sdk
pnpm -C core exec tsc --noEmit
```

The generator refuses to overwrite an existing connector directory. It creates a disabled adapter template that must be implemented and reviewed before registration. SDK fixtures need no provider credentials, PostgreSQL or running Core. A fresh dependency installation was not exercised in this delivery; production integration tests require the complete host environment and approved test accounts.

Follow the checkout's `CONTRIBUTING.md` for access and RFC submission. Core and Dash public source contributions are not open yet; these instructions do not change that policy or the source license.

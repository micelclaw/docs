---
title: FAQ
description: "Technical frequently asked questions about Micelclaw OS — architecture, system requirements, database, AI models, extensibility, search pipeline, and data portability."
---

For a non-technical overview, see the [FAQ on micelclaw.com](https://micelclaw.com/#faq).

## What's the tech stack?

PostgreSQL with pgvector for storage and vector search. Fastify (Node.js) for the REST API. React 19 with Vite and Tailwind CSS for the dashboard. Ollama for local AI inference (embeddings, entity extraction, voice). Docker for managed services (Jellyfin, Mailu, Firefly III, etc.). The project is a monorepo managed with pnpm workspaces.

## How does the AI work without a GPU?

Ollama runs quantized models on CPU. The embedding model is `qwen3-embedding` (0.6B parameters, 1024 dimensions) — small enough to embed a record in under 200ms on a modern CPU. Entity extraction uses `qwen3` (1.7B parameters). These models fit comfortably in 4 GB of RAM. No GPU, no CUDA, no cloud API keys required.

## What database does it use?

PostgreSQL with the pgvector extension. One database for everything: notes, calendar events, emails, contacts, files metadata, photo metadata, embeddings, the knowledge graph, and search indexes (tsvector). No Elasticsearch, no Redis, no separate search service. One backup strategy, one connection pool, one operational concern.

## What are the system requirements?

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Linux (Debian, Ubuntu, WSL2) | Debian 13 (Trixie) |
| Node.js | >=20 | 22 LTS |
| PostgreSQL | >=15 with pgvector | 16 with pgvector |
| pnpm | >=9 | Latest |
| RAM | 4 GB | 8 GB |
| Docker | Optional (for managed services) | Docker Engine 24+ |
| Ollama | Optional (for AI features) | Latest |

## Can I run it on Docker?

The core application (Fastify API + scheduler + sync engine) runs on bare metal as a Node.js process. Managed services — Jellyfin, Mailu, qBittorrent, Firefly III, Bitcoin Core, and 35+ others — run as Docker containers. The Service Lifecycle Manager orchestrates them: RAM budgeting, on-demand start/stop, scheduled windows, drain guards, and health monitoring. Docker Compose files are auto-generated from the service registry.

## How do I update?

```bash
git pull origin main
pnpm install
pnpm db:migrate
pnpm build
```

Migrations are idempotent and versioned with Drizzle ORM. No manual schema changes needed. The migration count is at 137+ and growing — each one is tested against the production schema before merging.

## Can I build custom skills?

Yes. Skills are markdown files (`SKILL.md`) that describe API endpoints, expected behavior, and examples. The AI agent reads the skill at runtime and learns to call the described APIs. Skills support metadata flags like `always:true` (loaded on every message) and `always:false` (activated by context). See [Creating a Skill](/skills/creating-a-skill) for a step-by-step guide.

## Can I build custom apps?

Yes. Apps are Docker containers registered in the service registry with a lifecycle policy (always-on, on-demand, or scheduled). They integrate into the dashboard via iframe embed or API proxy. The Service Lifecycle Manager handles starting, stopping, and health checking. See [Creating an App](/apps/creating-an-app) for details.

## How does search work?

Hybrid search with four signals fused via Reciprocal Rank Fusion (RRF):

1. **Semantic search** — pgvector cosine similarity against 1024-dim embeddings
2. **Full-text search** — tsvector with GIN indexes, weighted columns (title > content > tags), `UNION ALL` across all domain tables
3. **Knowledge graph** — entity overlap via `entity_links` table
4. **Heat scoring** — temporal relevance from the `record_heat` table

Signals are rank-normalized, degenerate signals are auto-suppressed, and multi-signal matches get a confidence bonus. Total latency: 30–80 ms, all inside PostgreSQL. Two endpoints: `GET /search` (standard RRF) and `GET /search/advanced` (user-tunable weights with provenance breakdown).

## Can I export my data?

Yes. All data lives in a single PostgreSQL database — standard `pg_dump` works. All files are on your filesystem in predictable paths. There are no proprietary formats, no binary blobs in the database (files are stored on disk, not in PostgreSQL), and no vendor lock-in. If you leave Micelclaw, your data comes with you.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "What's the tech stack?", "acceptedAnswer": {"@type": "Answer", "text": "PostgreSQL with pgvector, Fastify (Node.js), React 19 with Vite and Tailwind CSS, Ollama for local AI, Docker for managed services. Monorepo with pnpm workspaces."}},
    {"@type": "Question", "name": "How does the AI work without a GPU?", "acceptedAnswer": {"@type": "Answer", "text": "Ollama runs quantized models on CPU. Embedding: qwen3-embedding (0.6B params, 1024 dims). Entity extraction: qwen3 (1.7B). Fits in 4 GB RAM, no GPU required."}},
    {"@type": "Question", "name": "What database does it use?", "acceptedAnswer": {"@type": "Answer", "text": "PostgreSQL with pgvector extension. One database for everything: notes, calendar, emails, embeddings, knowledge graph. No Elasticsearch, no Redis."}},
    {"@type": "Question", "name": "What are the system requirements?", "acceptedAnswer": {"@type": "Answer", "text": "Node.js >=20, PostgreSQL >=15 with pgvector, pnpm >=9. 4 GB RAM minimum, 8 GB recommended. Docker optional for managed services, Ollama optional for AI."}},
    {"@type": "Question", "name": "Can I run it on Docker?", "acceptedAnswer": {"@type": "Answer", "text": "Core runs on bare metal (Node.js). Managed services run as Docker containers managed by the Service Lifecycle Manager with RAM budgeting and health monitoring."}},
    {"@type": "Question", "name": "How do I update?", "acceptedAnswer": {"@type": "Answer", "text": "git pull, pnpm install, pnpm db:migrate, pnpm build. Migrations are idempotent. No manual schema changes needed."}},
    {"@type": "Question", "name": "Can I build custom skills?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Skills are SKILL.md files that teach the AI agent new API endpoints. Supports always-on and on-demand activation."}},
    {"@type": "Question", "name": "Can I build custom apps?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Apps are Docker containers in the service registry with iframe or API integration. The Lifecycle Manager handles start/stop and health checks."}},
    {"@type": "Question", "name": "How does search work?", "acceptedAnswer": {"@type": "Answer", "text": "Hybrid search with Reciprocal Rank Fusion: pgvector semantic, tsvector full-text, knowledge graph, and heat scoring. 30-80ms, all inside PostgreSQL."}},
    {"@type": "Question", "name": "Can I export my data?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Standard pg_dump. All data in one PostgreSQL database, all files on your filesystem. No proprietary formats, no lock-in."}}
  ]
}
</script>

# Phase 3A: PostgreSQL + pgvector + Redis Architecture

## Overview

This document explains the Phase 3A data infrastructure in beginner-friendly language.

---

## What Is PostgreSQL?

PostgreSQL (often called "Postgres") is a **relational database**. Think of it as a very sophisticated, structured spreadsheet stored on disk that never loses data, even if the server restarts.

The Financial Intelligence Terminal uses PostgreSQL as its **single source of truth** — every piece of important data (events, market readings, news articles, analysis results) ultimately lives here permanently.

---

## What Is pgvector?

By itself, PostgreSQL stores text, numbers, and dates. It cannot natively store or search **embeddings**.

An **embedding** is a list of ~384 floating-point numbers that represents the *meaning* of a piece of text. For example, the phrase "Hurricane Katrina made landfall" gets converted into a dense vector like `[0.12, -0.87, 0.34, ...]`. Similar sentences produce similar vectors.

**pgvector** is a PostgreSQL extension that adds:
- A new column type: `vector(384)` — stores embedding arrays directly in a row.
- New operators for **similarity search**: find the N rows whose embedding is closest to a query embedding.

The key operator is:
```sql
-- "Cosine distance" — lower = more similar
SELECT event_name
FROM historical_events
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

This powers future RAG (Retrieval-Augmented Generation) — given a user question, we find the most semantically similar historical events stored in Postgres, then pass them to the LLM as context.

### Embedding Dimension

The embedding dimension **must match the model used to create the embeddings**.

- Our configured default: `all-MiniLM-L6-v2` → **384 dimensions**
- This is set in `.env` via `EMBEDDING_DIM=384`
- Do NOT change the dimension after data has been written without migrating the column

---

## What Is Redis?

Redis is an **in-memory key-value store**. Think of it as a very fast dictionary that lives in RAM. Because it uses RAM instead of disk, it can serve reads in under 1 millisecond.

Redis in this project is a **cache** — a fast temporary copy of data that is expensive to recompute or slow to fetch from external APIs.

### What Redis is NOT
- Redis is NOT a permanent database. Data can be lost on restart (unless persistence is configured).
- Redis does NOT replace PostgreSQL.

---

## Why Both? Aren't They Redundant?

No — they serve entirely different roles:

| | PostgreSQL | Redis |
|---|---|---|
| **Role** | Source of truth | Speed cache |
| **Storage** | Disk (persistent) | RAM (temporary) |
| **Data loss** | Never | Acceptable |
| **Typical latency** | 5–50ms | < 1ms |
| **Use case** | Store/query historical events, model results | Cache market prices, analysis results |

**Pattern**: A request first checks Redis. If data is there (a "cache hit"), return it immediately. If not (a "cache miss"), query PostgreSQL (or an external API), return the result, and write it to Redis for next time with a TTL (time-to-live).

---

## Cache Key Conventions

Keys follow a `namespace:identifier` pattern:

| Key Pattern | Example | TTL | Meaning |
|---|---|---|---|
| `market:{symbol}` | `market:XOM` | 5 min | Latest market price for a symbol |
| `weather:{location}` | `weather:US-LA` | 1 hour | Latest weather for a location |
| `news:{event_id}` | `news:evt_katrina_2005` | 24 hours | News articles for an event |
| `analysis:{run_id}` | `analysis:run_abc123` | 2 hours | Cached analysis results |

---

## How the Components Interact

```
User Request
     │
     ▼
FastAPI Backend
     │
     ├──► Redis (check cache)
     │         │ hit → return immediately
     │         │ miss ↓
     │
     ├──► PostgreSQL (source of truth)
     │         │
     │         └──► write result to Redis cache
     │
     └──► External APIs (FRED, Alpha Vantage, etc.)
               │
               └──► store in PostgreSQL + Redis
```

---

## File Structure

```
backend/app/
├── core/
│   ├── config.py      # Centralised settings (DATABASE_URL, REDIS_URL, etc.)
│   └── cache.py       # Cache key conventions and TTL constants
├── db/
│   ├── session.py     # SQLAlchemy engine, SessionLocal, Base, get_db()
│   └── init_db.py     # CREATE EXTENSION vector; create all tables
├── models/
│   └── core.py        # All SQLAlchemy ORM models (HistoricalEvent, Event, …)
└── services/
    └── redis_service.py  # RedisService: get/set/delete/exists + graceful failure
```

---

## Docker Startup Commands

```bash
# Start PostgreSQL (with pgvector) and Redis in the background
docker compose up -d

# Check that both services are healthy
docker compose ps

# Stop everything (data persists in the postgres_data volume)
docker compose down

# Completely wipe the database volume (WARNING: data loss)
docker compose down -v
```

---

## How to Inspect PostgreSQL

```bash
# Open an interactive Postgres shell
docker exec -it fit_postgres psql -U postgres -d fit_db

# Inside psql:
\dt                          -- list all tables
\d historical_events         -- describe the historical_events table
SELECT extname FROM pg_extension;   -- verify pgvector is loaded

# Test a vector insert (replace 384 zeros with real values in production):
INSERT INTO historical_events (event_id, event_name, event_year, event_type, embedding)
VALUES (
  'test_001',
  'Test Event',
  2005,
  'hurricane',
  array_fill(0.1, ARRAY[384])::vector
);
```

---

## How to Inspect Redis

```bash
# Open Redis CLI
docker exec -it fit_redis redis-cli

# Inside redis-cli:
PING                         # should return PONG
SET market:XOM "{\"price\":115.4}" EX 300
GET market:XOM
TTL market:XOM               # remaining seconds before expiry
KEYS *                       # list all keys (avoid in production with large datasets)
```

---

## How Vector Similarity Works (Conceptually)

Imagine each piece of text is a point in 384-dimensional space. Two texts that mean the same thing (e.g., "oil spill" and "petroleum leak") will have points that are close together. Two texts that mean different things ("hurricane" vs. "interest rates") will be far apart.

pgvector measures this "closeness" using:
- **Cosine distance** (`<=>`) — angle between two vectors; 0 = identical direction, 2 = opposite
- **L2 (Euclidean) distance** (`<->`) — straight-line distance between two points
- **Inner product** (`<#>`) — dot product (higher = more similar)

For semantic similarity, cosine distance is typically preferred.

---

## Running Tests

```bash
# Make sure Docker is running first:
docker compose up -d

# Then run the infrastructure test suite:
.venv-phase2b\Scripts\pytest -q tests/test_phase3a_infrastructure.py
```

Tests skip automatically if Docker services are unavailable, so CI never hard-fails on a missing database.

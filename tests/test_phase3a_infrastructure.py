"""
Phase 3A Infrastructure Tests — PostgreSQL + pgvector + Redis.

These tests require a running Docker Compose stack.
Skip gracefully when Docker services are unavailable so CI never
blocks on a missing infrastructure dependency.
"""
import json
import os
import time
import pytest
import sqlalchemy
from sqlalchemy import text

# ─── helpers ─────────────────────────────────────────────────────────────────

def _db_url():
    return os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:password@localhost:5432/fit_db"
    )

def _redis_url():
    return os.getenv("REDIS_URL", "redis://localhost:6379/0")


def _engine():
    return sqlalchemy.create_engine(_db_url(), pool_pre_ping=True)


def _try_connect(engine):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def _try_redis(url):
    try:
        import redis as _redis
        r = _redis.Redis.from_url(url, decode_responses=True, socket_connect_timeout=2)
        return r.ping(), r
    except Exception:
        return False, None


# ─── fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def db_engine():
    engine = _engine()
    if not _try_connect(engine):
        pytest.skip("PostgreSQL not reachable — start with: docker compose up -d")
    yield engine
    engine.dispose()


@pytest.fixture(scope="module")
def redis_conn():
    ok, r = _try_redis(_redis_url())
    if not ok:
        pytest.skip("Redis not reachable — start with: docker compose up -d")
    yield r


# ─── PostgreSQL Tests ─────────────────────────────────────────────────────────

class TestPostgresConnection:
    def test_ping(self, db_engine):
        with db_engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
        assert result == 1

    def test_fit_db_exists(self, db_engine):
        with db_engine.connect() as conn:
            result = conn.execute(
                text("SELECT datname FROM pg_database WHERE datname='fit_db'")
            ).fetchone()
        assert result is not None


class TestPgVector:
    def test_extension_available(self, db_engine):
        with db_engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM pg_extension WHERE extname='vector'")
            ).fetchone()
        assert result is not None, "pgvector extension must be installed"

    def test_vector_insert_and_similarity_search(self, db_engine):
        dim = int(os.getenv("EMBEDDING_DIM", 384))
        vec_a = "[" + ",".join(["0.1"] * dim) + "]"
        vec_b = "[" + ",".join(["0.9"] * dim) + "]"
        vec_q = "[" + ",".join(["0.12"] * dim) + "]"   # closest to vec_a

        with db_engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.execute(text(
                f"""
                CREATE TABLE IF NOT EXISTS _test_vectors (
                    id SERIAL PRIMARY KEY,
                    label TEXT,
                    embedding vector({dim})
                );
                """
            ))
            conn.execute(text(
                f"INSERT INTO _test_vectors (label, embedding) VALUES ('A', '{vec_a}'), ('B', '{vec_b}');"
            ))
            conn.commit()

            result = conn.execute(text(
                f"""
                SELECT label, embedding <=> '{vec_q}' AS distance
                FROM _test_vectors
                ORDER BY distance ASC
                LIMIT 1;
                """
            )).fetchone()

            # Cleanup
            conn.execute(text("DROP TABLE IF EXISTS _test_vectors;"))
            conn.commit()

        assert result is not None
        assert result[0] == "A", f"Expected 'A' to be closest, got {result[0]}"

    def test_historical_events_table_exists(self, db_engine):
        """Table should be created by init_db."""
        with db_engine.connect() as conn:
            result = conn.execute(text(
                "SELECT to_regclass('public.historical_events');"
            )).scalar()
        assert result is not None, "historical_events table must exist"


# ─── Redis Tests ──────────────────────────────────────────────────────────────

class TestRedisBasic:
    def test_ping(self, redis_conn):
        assert redis_conn.ping()

    def test_set_and_get(self, redis_conn):
        redis_conn.set("test:key", json.dumps({"value": 42}))
        raw = redis_conn.get("test:key")
        data = json.loads(raw)
        assert data["value"] == 42
        redis_conn.delete("test:key")

    def test_delete(self, redis_conn):
        redis_conn.set("test:del", "bye")
        redis_conn.delete("test:del")
        assert redis_conn.get("test:del") is None

    def test_exists(self, redis_conn):
        redis_conn.set("test:exists", "1")
        assert redis_conn.exists("test:exists") > 0
        redis_conn.delete("test:exists")
        assert redis_conn.exists("test:exists") == 0


class TestRedisTTL:
    def test_ttl_expires(self, redis_conn):
        redis_conn.set("test:ttl", "will_expire", ex=1)
        assert redis_conn.get("test:ttl") is not None
        time.sleep(1.5)
        assert redis_conn.get("test:ttl") is None

    def test_market_cache_key(self, redis_conn):
        key = "market:XOM"
        payload = json.dumps({"price": 115.4, "ts": "2026-10-03"})
        redis_conn.set(key, payload, ex=300)
        result = json.loads(redis_conn.get(key))
        assert result["price"] == 115.4
        ttl = redis_conn.ttl(key)
        assert 0 < ttl <= 300
        redis_conn.delete(key)


class TestRedisService:
    """Tests against the RedisService abstraction (graceful failure required)."""

    def test_service_set_get(self):
        from app.services.redis_service import RedisService
        svc = RedisService()
        if not svc._is_healthy:
            pytest.skip("Redis unavailable — graceful degradation verified")
        assert svc.set("svc:test", {"hello": "world"}, ttl_seconds=60)
        result = svc.get("svc:test")
        assert result == {"hello": "world"}
        svc.delete("svc:test")

    def test_service_degraded_does_not_crash(self):
        from app.services.redis_service import RedisService
        svc = RedisService.__new__(RedisService)
        svc.client = None
        svc._is_healthy = False
        assert svc.get("anything") is None
        assert svc.set("anything", "value") is False
        assert svc.delete("anything") is False
        assert svc.exists("anything") is False
        assert svc.check_health() is False

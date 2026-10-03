"""
Embedding Service — Phase 3B
================================
Wraps sentence-transformers all-MiniLM-L6-v2 (or the model
set in EMBEDDING_MODEL / EMBEDDING_DIM) for deterministic,
single-load-per-process vector generation.

Key rules:
  - Model loaded exactly ONCE at module import time.
  - No fake/random fallback embeddings.
  - Empty/whitespace input → ValueError, never silently embedded.
  - Output dimension is validated against EMBEDDING_DIM.
  - Logging at init time so startup is auditable.
"""

from __future__ import annotations

import logging
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# ── late import so tests that mock this can patch at the right level ─────────
_model = None
_model_name: str = ""
_expected_dim: int = 384
_init_error: Optional[str] = None


def _load_model() -> None:
    """Load the sentence-transformer model once.  Called at first use."""
    global _model, _model_name, _expected_dim, _init_error

    try:
        import os
        os.environ["TOKENIZERS_PARALLELISM"] = "false"
        
        from app.core.config import settings
        from sentence_transformers import SentenceTransformer

        _model_name = settings.EMBEDDING_MODEL
        _expected_dim = settings.EMBEDDING_DIM

        logger.info(f"[EmbeddingService] Loading model: {_model_name}  dim={_expected_dim}")
        try:
            _model = SentenceTransformer(_model_name, local_files_only=True)
        except Exception as e:
            logger.warning(f"local_files_only failed, trying normal mode: {e}")
            _model = SentenceTransformer(_model_name)

        # Validate dimension immediately with a probe
        probe = _model.encode("probe", convert_to_numpy=True)
        actual_dim = int(probe.shape[0])
        if actual_dim != _expected_dim:
            raise ValueError(
                f"Model output dimension {actual_dim} does not match "
                f"EMBEDDING_DIM={_expected_dim}. Update config before proceeding."
            )

        logger.info(
            f"[EmbeddingService] Model ready. name={_model_name}  "
            f"dim={actual_dim}  ✓"
        )
    except Exception as exc:
        _init_error = str(exc)
        _model = None
        logger.error(f"[EmbeddingService] FATAL — could not load model: {exc}")
        raise RuntimeError(f"EmbeddingService failed to initialise: {exc}") from exc


def _ensure_loaded() -> None:
    if _model is None:
        _load_model()


def _validate_text(text: object) -> str:
    """Raise ValueError for any input that should not be embedded."""
    if not isinstance(text, str):
        raise ValueError(
            f"embed_text requires a str, got {type(text).__name__!r}"
        )
    cleaned = text.strip()
    if not cleaned:
        raise ValueError("embed_text received an empty/whitespace-only string.")
    return cleaned


def embed_text(text: str) -> np.ndarray:
    """
    Embed a single text string.

    Returns
    -------
    np.ndarray  shape=(EMBEDDING_DIM,)

    Raises
    ------
    ValueError  — empty/whitespace/non-string input
    RuntimeError — model failed to load
    """
    _ensure_loaded()
    cleaned = _validate_text(text)
    vec: np.ndarray = _model.encode(cleaned, convert_to_numpy=True)
    assert vec.shape[0] == _expected_dim, (
        f"Unexpected embedding dim {vec.shape[0]} (expected {_expected_dim})"
    )
    return vec


def embed_texts(texts: list[str]) -> list[np.ndarray]:
    """
    Embed a batch of texts.  All texts must be non-empty strings.

    Returns
    -------
    list of np.ndarray, each shape=(EMBEDDING_DIM,)
    Preserves input order.  Raises ValueError on first invalid text.
    """
    _ensure_loaded()
    if not texts:
        return []
    cleaned = [_validate_text(t) for t in texts]
    matrix: np.ndarray = _model.encode(cleaned, convert_to_numpy=True)
    return [matrix[i] for i in range(len(cleaned))]


def model_info() -> dict:
    """Return current model metadata for provenance logging."""
    _ensure_loaded()
    return {
        "model_name": _model_name,
        "embedding_dim": _expected_dim,
        "ready": _model is not None,
    }

import os
# Fix Windows OpenMP collision
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
# Force HuggingFace to strictly use local cache and avoid WinError 10013 socket permissions
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
import torch
import sentence_transformers
import transformers

import torch
import sentence_transformers
import transformers

try:
    import sys
    import os
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
    
    from app.services.embedding_service import _ensure_loaded
    _ensure_loaded()
    print("Successfully preloaded embedding_service._model")
except Exception as e:
    print(f"Warning: Failed to preload embedding_service: {e}")

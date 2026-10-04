import sys
sys.path.append('backend')
from app.services.embedding_service import embed_text

try:
    print("Testing embed_text...")
    vec = embed_text("Test sentence")
    print("Success. Dim:", len(vec))
except Exception as e:
    import traceback
    traceback.print_exc()

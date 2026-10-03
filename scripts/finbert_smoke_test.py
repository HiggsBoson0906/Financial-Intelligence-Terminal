import sys
import time
from pathlib import Path

# Add project root to path so we can import backend.app
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.services.sentiment_service import SentimentService

def run_smoke_test():
    print("Loading FinBERT Service...")
    start = time.time()
    service = SentimentService()
    print(f"Service loaded in {time.time() - start:.2f} seconds.")
    
    sentences = [
        "The company reported a massive surge in quarterly profits, exceeding all market expectations.",
        "Due to severe supply chain disruptions and plummeting sales, the firm announced bankruptcy.",
        "The committee will hold its regular meeting on Thursday to discuss procedural updates.",
        "",
        "   ",
        None,
        12345
    ]
    
    print("\n--- INDIVIDUAL INFERENCE ---")
    for s in sentences:
        try:
            start = time.time()
            res = service.analyze_text(s)
            latency = time.time() - start
            print(f"Input: {repr(s)}")
            print(f"Output: {res} | Latency: {latency:.4f}s")
        except Exception as e:
            print(f"Input: {repr(s)} | Error: {e}")
            
    print("\n--- BATCH INFERENCE (ARTICLES) ---")
    articles = [
        {"date": "2020-01-01", "text": "Great profits!"},
        {"date": "2020-01-02", "text": "Terrible losses."},
        {"date": "2020-01-03", "text": "", "status": "no_match"},
        {"date": "2020-01-04", "text": None, "status": "not_collected"}
    ]
    try:
        start = time.time()
        df = service.analyze_articles(articles)
        latency = time.time() - start
        print(f"Batch Latency: {latency:.4f}s")
        print("Batch Output DataFrame:")
        print(df.to_string())
    except Exception as e:
        print(f"Batch Error: {e}")

if __name__ == '__main__':
    run_smoke_test()

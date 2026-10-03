import time
from transformers import pipeline

def run_smoke_test():
    print("Loading FinBERT...")
    start = time.time()
    # model='ProsusAI/finbert'
    sentiment_pipeline = pipeline("sentiment-analysis", model="ProsusAI/finbert", device=-1)
    print(f"Model loaded in {time.time() - start:.2f} seconds.")
    
    sentences = [
        "The company reported a massive surge in quarterly profits, exceeding all market expectations.",
        "Due to severe supply chain disruptions and plummeting sales, the firm announced bankruptcy.",
        "The committee will hold its regular meeting on Thursday to discuss procedural updates.",
        "",
        None
    ]
    
    print("\n--- INDIVIDUAL INFERENCE ---")
    for s in sentences:
        try:
            start = time.time()
            if s is None:
                # Transformers pipeline fails on None usually, simulate it
                res = sentiment_pipeline("")
            else:
                res = sentiment_pipeline(s)
            latency = time.time() - start
            print(f"Input: {repr(s)}")
            print(f"Output: {res} | Latency: {latency:.4f}s")
        except Exception as e:
            print(f"Input: {repr(s)} | Error: {e}")
            
    print("\n--- BATCH INFERENCE ---")
    batch = [s for s in sentences if s]
    try:
        start = time.time()
        res = sentiment_pipeline(batch)
        latency = time.time() - start
        print(f"Batch Input: {batch}")
        print(f"Batch Output: {res} | Latency: {latency:.4f}s")
    except Exception as e:
        print(f"Batch Error: {e}")

if __name__ == '__main__':
    run_smoke_test()

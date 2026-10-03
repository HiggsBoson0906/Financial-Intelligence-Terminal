# Historical RAG Architecture

This document describes the Retrieval-Augmented Generation (RAG) architecture for historical events in Phase 3B.

## A. Embeddings
We generate a deterministic string representation of historical events using known attributes (e.g., wind speed, location, severity). We do not invent narratives. 

## B. all-MiniLM-L6-v2
We use `sentence-transformers/all-MiniLM-L6-v2` as our embedding model for fast and robust local embeddings. The model is loaded once per process to optimize latency.

## C. 384 Dimensions
The model natively produces 384-dimensional vectors. The embedding service validates this dimension before accepting the model instance.

## D. pgvector Cosine Similarity
Embeddings are inserted into a PostgreSQL database with the `pgvector` extension. Retrieval uses the `<=>` operator to find the top-K matches using Cosine Distance (`1 - cosine_distance` for similarity).

## E. Historical Retrieval
The retrieval pipeline (`retrieve_similar_events`) matches unstructured natural-language queries against the embedded historical events.

## F. Cross-Asset Reactions
For retrieved events, we map the known reactions of 6 assets (XOM, CVX, COP, OXY, XLE, SPY). Missing data is explicitly marked.

## G. Macro Parallels
Macroeconomic parallels (e.g., CPI, Fed Funds Rate, WTI) are appended to the event context. These are strictly sourced from the dataset aligned to the date of the event.

## H. Redis Cache
The complete structured RAG response is cached in Redis using a 300-second TTL. The cache key is derived from a SHA256 hash of the query text and `top_k` value. If Redis is unavailable, retrieval proceeds seamlessly.

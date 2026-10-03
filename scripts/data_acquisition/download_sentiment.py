import argparse
from pathlib import Path
from .config import SENTIMENT_RAW_DIR, PROVENANCE_DIR, PHRASEBANK_URL
from .utils import robust_download, save_provenance, calculate_checksum, logger

PHRASEBANK_FALLBACK_URLS = [
    PHRASEBANK_URL,
    "https://raw.githubusercontent.com/maxwellsarpong/NLP-financial-text-processing-dataset/master/Sentences_50Agree.txt"
]


def download_sentiment(force: bool = False) -> Path:
    """
    Acquires Financial PhraseBank dataset for sentiment pipeline evaluation.
    Preserves original labels and sentences.
    """
    SENTIMENT_RAW_DIR.mkdir(parents=True, exist_ok=True)
    destination = SENTIMENT_RAW_DIR / "Sentences_50Agree.txt"

    if destination.exists() and destination.stat().st_size > 1000 and not force:
        logger.info(f"Sentiment file already exists at {destination}. Skipping download (idempotent).")
        checksum = calculate_checksum(destination)
        save_provenance(
            source_name="Financial_PhraseBank",
            source_url=PHRASEBANK_URL,
            provider="Malo et al. (Aalto University)",
            date_range={"start": "N/A", "end": "N/A"},
            parameters={"agreement_level": "50Agree"},
            local_filename=str(destination.relative_to(destination.parent.parent.parent)),
            output_dir=PROVENANCE_DIR,
            dataset_version="v1.0",
            checksum=checksum,
            notes="Benchmark evaluation dataset for financial sentiment. Not production news corpus."
        )
        return destination

    logger.info("Downloading Financial PhraseBank benchmark dataset...")
    success = False
    used_url = None
    for url in PHRASEBANK_FALLBACK_URLS:
        logger.info(f"Trying PhraseBank URL: {url}")
        success = robust_download(url, destination, max_retries=2, timeout=30)
        if success and destination.exists() and destination.stat().st_size > 1000:
            used_url = url
            break

    if not success or not destination.exists() or destination.stat().st_size < 1000:
        raise RuntimeError("Failed to download Financial PhraseBank dataset.")

    checksum = calculate_checksum(destination)
    save_provenance(
        source_name="Financial_PhraseBank",
        source_url=used_url or PHRASEBANK_URL,
        provider="Malo et al. (Aalto University)",
        date_range={"start": "N/A", "end": "N/A"},
        parameters={"agreement_level": "50Agree"},
        local_filename=str(destination.relative_to(destination.parent.parent.parent)),
        output_dir=PROVENANCE_DIR,
        dataset_version="v1.0",
        checksum=checksum,
        notes="Benchmark evaluation dataset for financial sentiment. Not production news corpus."
    )
    return destination


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download Financial PhraseBank dataset")
    parser.add_argument("--force", action="store_true", help="Force redownload")
    args = parser.parse_args()
    download_sentiment(force=args.force)

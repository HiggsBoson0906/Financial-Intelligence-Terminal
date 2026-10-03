import argparse
from pathlib import Path
from .config import HURRICANES_RAW_DIR, PROVENANCE_DIR, HURDAT2_URL
from .utils import robust_download, save_provenance, calculate_checksum, logger

HURDAT2_FALLBACK_URLS = [
    HURDAT2_URL,
    "https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2023-051124.txt",
    "https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2022-050423.txt"
]


def download_hurdat(force: bool = False) -> Path:
    """
    Downloads NOAA HURDAT2 North Atlantic tropical cyclone dataset for independent validation.
    """
    HURRICANES_RAW_DIR.mkdir(parents=True, exist_ok=True)
    destination = HURRICANES_RAW_DIR / "hurdat2.txt"

    if destination.exists() and destination.stat().st_size > 1000 and not force:
        logger.info(f"HURDAT2 raw file already exists at {destination}. Skipping download (idempotent).")
        checksum = calculate_checksum(destination)
        save_provenance(
            source_name="NOAA HURDAT2",
            source_url=HURDAT2_URL,
            provider="NOAA NHC",
            date_range={"start": "2010-01-01", "end": "2024-12-31"},
            parameters={"basin": "Atlantic", "format": "text"},
            local_filename=str(destination.relative_to(destination.parent.parent.parent)),
            output_dir=PROVENANCE_DIR,
            dataset_version="1851-present",
            checksum=checksum,
            notes="Independent validation dataset from National Hurricane Center"
        )
        return destination

    logger.info("Attempting to download NOAA HURDAT2 dataset...")
    success = False
    used_url = None
    for url in HURDAT2_FALLBACK_URLS:
        logger.info(f"Trying HURDAT2 URL: {url}")
        success = robust_download(url, destination, max_retries=2, timeout=45)
        if success and destination.exists() and destination.stat().st_size > 1000:
            used_url = url
            break

    if not success or not destination.exists() or destination.stat().st_size < 1000:
        raise RuntimeError("Failed to download NOAA HURDAT2 dataset from NHC.")

    checksum = calculate_checksum(destination)
    save_provenance(
        source_name="NOAA HURDAT2",
        source_url=used_url or HURDAT2_URL,
        provider="NOAA NHC",
        date_range={"start": "2010-01-01", "end": "2024-12-31"},
        parameters={"basin": "Atlantic", "format": "text"},
        local_filename=str(destination.relative_to(destination.parent.parent.parent)),
        output_dir=PROVENANCE_DIR,
        dataset_version="1851-present",
        checksum=checksum,
        notes="Independent validation dataset from National Hurricane Center"
    )
    return destination


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download NOAA HURDAT2 dataset")
    parser.add_argument("--force", action="store_true", help="Force redownload")
    args = parser.parse_args()
    download_hurdat(force=args.force)

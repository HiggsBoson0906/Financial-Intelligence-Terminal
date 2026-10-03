import argparse
from pathlib import Path
from .config import HURRICANES_RAW_DIR, PROVENANCE_DIR, IBTRACS_NA_URL, IBTRACS_BACKUP_URL
from .utils import robust_download, save_provenance, calculate_checksum, logger


def download_ibtracs(force: bool = False) -> Path:
    """
    Downloads NOAA IBTrACS North Atlantic CSV dataset.
    """
    HURRICANES_RAW_DIR.mkdir(parents=True, exist_ok=True)
    destination = HURRICANES_RAW_DIR / "ibtracs_NA.csv"

    if destination.exists() and destination.stat().st_size > 1000 and not force:
        logger.info(f"IBTrACS raw file already exists at {destination}. Skipping download (idempotent).")
        checksum = calculate_checksum(destination)
        save_provenance(
            source_name="NOAA IBTrACS",
            source_url=IBTRACS_NA_URL,
            provider="NOAA NCEI",
            date_range={"start": "2010-01-01", "end": "2025-12-31"},
            parameters={"basin": "NA", "format": "csv"},
            local_filename=str(destination.relative_to(destination.parent.parent.parent)),
            output_dir=PROVENANCE_DIR,
            dataset_version="v04r01",
            checksum=checksum,
            notes="Official North Atlantic IBTrACS track data"
        )
        return destination

    logger.info("Attempting to download IBTrACS North Atlantic dataset...")
    success = robust_download(IBTRACS_NA_URL, destination, max_retries=3, timeout=60)
    used_url = IBTRACS_NA_URL
    if not success:
        logger.warning(f"Primary URL failed. Trying backup URL: {IBTRACS_BACKUP_URL}")
        success = robust_download(IBTRACS_BACKUP_URL, destination, max_retries=3, timeout=60)
        used_url = IBTRACS_BACKUP_URL

    if not success or not destination.exists() or destination.stat().st_size < 1000:
        raise RuntimeError("Failed to download NOAA IBTrACS dataset from both primary and backup URLs.")

    checksum = calculate_checksum(destination)
    save_provenance(
        source_name="NOAA IBTrACS",
        source_url=used_url,
        provider="NOAA NCEI",
        date_range={"start": "2010-01-01", "end": "2025-12-31"},
        parameters={"basin": "NA", "format": "csv"},
        local_filename=str(destination.relative_to(destination.parent.parent.parent)),
        output_dir=PROVENANCE_DIR,
        dataset_version="v04r01",
        checksum=checksum,
        notes="Official North Atlantic IBTrACS track data"
    )
    return destination


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download NOAA IBTrACS dataset")
    parser.add_argument("--force", action="store_true", help="Force redownload")
    args = parser.parse_args()
    download_ibtracs(force=args.force)

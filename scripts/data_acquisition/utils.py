import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any
import requests
import time

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("data_acquisition")


def calculate_checksum(filepath: Path) -> str:
    """Calculates SHA-256 checksum for a file."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def save_provenance(
    source_name: str,
    source_url: str,
    provider: str,
    date_range: Dict[str, str],
    parameters: Dict[str, Any],
    local_filename: str,
    output_dir: Path,
    dataset_version: Optional[str] = None,
    checksum: Optional[str] = None,
    notes: Optional[str] = None
) -> Path:
    """Saves structured provenance metadata as JSON in output_dir."""
    output_dir.mkdir(parents=True, exist_ok=True)
    provenance_record = {
        "source_name": source_name,
        "source_url": source_url,
        "provider": provider,
        "download_timestamp": datetime.now(timezone.utc).isoformat(),
        "date_range": date_range,
        "parameters": parameters,
        "local_filename": local_filename,
        "dataset_version_if_available": dataset_version,
        "checksum_when_practical": checksum,
        "notes": notes
    }
    safe_name = source_name.lower().replace(" ", "_").replace("/", "_")
    output_file = output_dir / f"{safe_name}_provenance.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(provenance_record, f, indent=2)
    logger.info(f"Provenance saved to {output_file}")
    return output_file


def robust_download(
    url: str,
    destination: Path,
    max_retries: int = 5,
    timeout: int = 45,
    backoff_factor: float = 1.5,
    headers: Optional[Dict[str, str]] = None
) -> bool:
    """
    Downloads file from url to destination with retries and exponential backoff.
    Supports HTTP Range resumption for large downloads.
    """
    destination.parent.mkdir(parents=True, exist_ok=True)
    temp_destination = destination.with_suffix(destination.suffix + ".tmp")
    base_headers = dict(headers or {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    
    for attempt in range(1, max_retries + 1):
        try:
            req_headers = dict(base_headers)
            mode = "wb"
            start_byte = 0
            if temp_destination.exists() and temp_destination.stat().st_size > 0:
                start_byte = temp_destination.stat().st_size
                req_headers["Range"] = f"bytes={start_byte}-"
                mode = "ab"
                logger.info(f"Resuming download from byte {start_byte:,} (Attempt {attempt}/{max_retries})...")
            else:
                logger.info(f"Downloading from {url} (Attempt {attempt}/{max_retries})...")

            with requests.get(url, stream=True, timeout=timeout, headers=req_headers) as response:
                if response.status_code == 416:  # Range not satisfiable, file already completed
                    temp_destination.replace(destination)
                    logger.info(f"File already complete: {destination.name}")
                    return True
                response.raise_for_status()
                # If server replied with 200 instead of 206 Partial Content, overwrite from start
                if response.status_code == 200 and start_byte > 0:
                    mode = "wb"

                with open(temp_destination, mode) as f:
                    for chunk in response.iter_content(chunk_size=1024 * 128):
                        if chunk:
                            f.write(chunk)

            # Check completion
            if temp_destination.exists() and temp_destination.stat().st_size > 1000:
                temp_destination.replace(destination)
                logger.info(f"Successfully downloaded {destination.name} ({destination.stat().st_size:,} bytes)")
                return True
        except Exception as e:
            curr_size = temp_destination.stat().st_size if temp_destination.exists() else 0
            logger.warning(f"Download attempt {attempt} failed at {curr_size:,} bytes: {e}")
            if attempt < max_retries:
                sleep_time = backoff_factor ** attempt
                logger.info(f"Sleeping {sleep_time:.1f}s before resuming...")
                time.sleep(sleep_time)
            else:
                logger.error(f"Failed to download {url} after {max_retries} attempts.")
                return False
    return False

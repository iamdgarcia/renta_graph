import os
import requests

# NOTE: This URL points to the 2024 manual (published for the 2024 fiscal year).
# Each year AEAT publishes a new manual. Update this URL annually when the new
# manual becomes available, typically between April and June of the following year.
AEAT_PDF_URL = (
    "https://www.agenciatributaria.es/static_files/AEAT_Sede/"
    "Ayuda/Manual_Practico_Renta_2024/Manual_Practico_Renta_2024.pdf"
)
OUTPUT_PATH = "raw/manual_renta_2025.pdf"


def download_manual_renta():
    os.makedirs("raw", exist_ok=True)
    if os.path.exists(OUTPUT_PATH):
        print(f"  [aeat] Already downloaded: {OUTPUT_PATH}")
        return
    print(f"  [aeat] Downloading from {AEAT_PDF_URL} ...")
    resp = requests.get(AEAT_PDF_URL, timeout=120, stream=True)
    resp.raise_for_status()
    with open(OUTPUT_PATH, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"  [aeat] Saved to {OUTPUT_PATH}")

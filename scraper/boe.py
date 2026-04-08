import os
import requests

RAW_DIR = "raw"

# Key BOE search URLs for regional income tax deductions
# These pages contain normativa autonómica for IRPF deductions
BOE_REGIONS = {
    "madrid": "https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c16/c16-1.html",
    "cataluna": "https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c16/c16-2.html",
    "andalucia": "https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c16/c16-3.html",
    "valencia": "https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c16/c16-4.html",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; RentaGraph/1.0; +https://github.com/rentagraph)"
}


def download_boe_autonomica():
    os.makedirs(RAW_DIR, exist_ok=True)
    for region, url in BOE_REGIONS.items():
        output_path = os.path.join(RAW_DIR, f"boe_{region}.html")
        if os.path.exists(output_path):
            print(f"  [boe] Already downloaded: {output_path}")
            continue
        print(f"  [boe] Fetching {region}: {url}")
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            resp.raise_for_status()
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(resp.text)
            print(f"  [boe] Saved to {output_path}")
        except requests.RequestException as e:
            print(f"  [boe] WARNING: Could not fetch {region}: {e}")

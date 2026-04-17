import os
import requests
import urllib3

# The AEAT (Agencia Tributaria) publishes the IRPF manual as two PDFs:
#   Parte 1 — general IRPF rules: rendimientos, deducciones estatales, cálculo de cuota
#   Parte 2 — all 15 autonomous communities' deductions in a single PDF
#             (Navarra and País Vasco use foral tax agencies and are NOT covered here)
#
# Update these URLs each year by checking:
#   https://sede.agenciatributaria.gob.es/Sede/manuales-practicos.html
AEAT_BASE = "https://sede.agenciatributaria.gob.es"
MANUALS = [
    (
        f"{AEAT_BASE}/static_files/Sede/Biblioteca/Manual/Practicos/"
        "IRPF/IRPF-2025/ManualRenta2025Parte1_es_es.pdf",
        "raw/manual_renta_2025_parte1.pdf",
        "Renta 2025 — Parte 1 (Reglas generales IRPF)",
    ),
    (
        f"{AEAT_BASE}/static_files/Sede/Biblioteca/Manual/Practicos/"
        "IRPF/IRPF-2025-Deducciones-autonomicas/ManualRenta2025Parte2_es_es.pdf",
        "raw/manual_renta_2025_parte2_autonomicas.pdf",
        "Renta 2025 — Parte 2 (Deducciones autonómicas, todas las CCAA)",
    ),
]

# sede.agenciatributaria.gob.es is signed by FNMT-RCM (Spanish government CA)
# using SHA-1, which OpenSSL 3.0 rejects by default. This is a well-known issue
# with Spanish government sites. The content is public and the URLs are fixed,
# so disabling SSL verification here is an accepted operational workaround.
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def _download(url: str, output_path: str, label: str) -> None:
    if os.path.exists(output_path):
        print(f"  [aeat] Already downloaded: {output_path}")
        return
    print(f"  [aeat] Downloading {label} ...")
    resp = requests.get(url, timeout=300, stream=True, verify=False)
    resp.raise_for_status()
    with open(output_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=65536):
            if chunk:
                f.write(chunk)
    size_mb = os.path.getsize(output_path) / 1_048_576
    print(f"  [aeat] Saved {output_path} ({size_mb:.1f} MB)")


def download_manual_renta() -> None:
    os.makedirs("raw", exist_ok=True)
    for url, output_path, label in MANUALS:
        _download(url, output_path, label)

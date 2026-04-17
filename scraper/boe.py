"""
BOE / regional deductions scraper — superseded by AEAT Parte 2 PDF.

The AEAT now publishes all 15 autonomous communities' IRPF deductions in a
single PDF (ManualRenta2025Parte2_es_es.pdf), which scraper/aeat.py downloads.
The old per-community HTML pages (c16-1 … c16-N) no longer exist on the AEAT
website as of the 2025 edition.

This module is kept as a no-op so that pipeline.py can still call it without
breaking. If the AEAT restores per-community HTML pages in a future year, add
the URLs here.
"""


def download_boe_autonomica() -> None:
    print("  [boe] All autonomous-community deductions are covered by the AEAT Parte 2 PDF — nothing to do here.")

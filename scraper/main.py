from scraper.aeat import download_manual_renta
from scraper.boe import download_boe_autonomica
from scraper.pages import download_extra_pages
from scraper.renta_ayuda_tecnica import download_renta_ayuda_tecnica


def run():
    print("=== Scraper: AEAT PDFs ===")
    download_manual_renta()

    print("=== Scraper: Extra AEAT pages & PDFs ===")
    download_extra_pages()

    print("=== Scraper: Renta - Ayuda técnica (subpáginas) ===")
    download_renta_ayuda_tecnica()

    print("=== Scraper: BOE Normativa Autonómica ===")
    download_boe_autonomica()

    print("=== Scraping complete ===")

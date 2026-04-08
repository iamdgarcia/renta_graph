from scraper.aeat import download_manual_renta
from scraper.boe import download_boe_autonomica


def run():
    print("=== Scraper: AEAT ===")
    download_manual_renta()
    print("=== Scraper: BOE Normativa Autonómica ===")
    download_boe_autonomica()
    print("=== Scraping complete ===")

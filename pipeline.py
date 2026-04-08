#!/usr/bin/env python3
"""
RentaGraph Pipeline — unified CLI for scraping and compiling the wiki.

Usage:
    python pipeline.py scrape
    python pipeline.py compile [--force]
    python pipeline.py all [--force]
"""
import argparse
import sys


def main():
    parser = argparse.ArgumentParser(
        description="RentaGraph data pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("scrape", help="Download raw documents from AEAT and BOE")

    compile_parser = subparsers.add_parser("compile", help="Parse and compile wiki from raw documents")
    compile_parser.add_argument("--force", action="store_true", help="Overwrite existing wiki articles")

    all_parser = subparsers.add_parser("all", help="Run scrape then compile")
    all_parser.add_argument("--force", action="store_true", help="Overwrite existing wiki articles")

    args = parser.parse_args()

    if args.command == "scrape":
        from scraper.main import run as scrape
        scrape()
    elif args.command == "compile":
        from compiler.main import run as compile_run
        compile_run(force=getattr(args, "force", False))
    elif args.command == "all":
        from scraper.main import run as scrape
        from compiler.main import run as compile_run
        scrape()
        compile_run(force=getattr(args, "force", False))


if __name__ == "__main__":
    main()

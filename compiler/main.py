from compiler.parser import parse_all
from compiler.discoverer import discover_topics
from compiler.llm import compile_wiki
from compiler.index_builder import build_index


def run(force: bool = False):
    print("=== Compiler: Parsing raw documents ===")
    parse_all()

    print("=== Compiler: Phase 1 — Topic discovery (index-first) ===")
    discover_topics(force=force)

    print("=== Compiler: Phase 2 — Article writing (explode index) ===")
    compile_wiki(force=force)

    print("=== Compiler: Building wiki index ===")
    build_index()

    print("=== Compilation complete ===")

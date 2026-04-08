import argparse
from compiler.parser import parse_all
from compiler.llm import compile_wiki
from compiler.index_builder import build_index


def run(force: bool = False):
    print("=== Compiler: Parsing raw documents ===")
    parse_all()
    print("=== Compiler: LLM compilation ===")
    compile_wiki(force=force)
    print("=== Compiler: Building index ===")
    build_index()
    print("=== Compilation complete ===")

#!/usr/bin/env bash
# RentaGraph — project runner
# Usage:
#   ./start.sh          — start the web app (dev server)
#   ./start.sh pipeline — run the full Python pipeline (scrape + compile)
#   ./start.sh scrape   — scrape only
#   ./start.sh compile  — compile only (--force to overwrite)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT/app"

load_dotenv() {
  # Load KEY=VALUE lines from $ROOT/.env into environment without overwriting
  if [[ -f "$ROOT/.env" ]]; then
    echo "==> Loading $ROOT/.env into environment"
    while IFS= read -r line || [[ -n "$line" ]]; do
      # skip empty and comment lines
      case "$line" in
        ''|\#*) continue ;;
      esac
      # split key and value at first '='
      key=${line%%=*}
      val=${line#*=}
      # trim surrounding double quotes if present
      if [[ ${val:0:1} == '"' && ${val: -1} == '"' ]]; then
        val=${val:1:-1}
      fi
      # export only if not already set
      if [[ -z "${!key:-}" ]]; then
        export "$key=$val"
      fi
    done < "$ROOT/.env"
  fi
}

run_webapp() {
  # Load .env into environment (do not override already set variables)
  load_dotenv

  echo "==> Installing Node dependencies..."
  (cd "$APP_DIR" && npm install --prefer-offline 2>/dev/null || npm install)

  echo "==> Starting dev server at http://localhost:3000"
  (cd "$APP_DIR" && npm run dev)
}

run_pipeline() {
  local cmd="${1:-all}"
  shift || true
  # Load .env into environment (do not override already set variables)
  load_dotenv

  if [[ -z "${OPENAI_API_KEY:-}" ]]; then
    echo "ERROR: OPENAI_API_KEY is not set." >&2
    echo "  Set it in your shell or create a .env file at the repo root." >&2
    exit 1
  fi

  echo "==> Installing Python dependencies..."
  pip install -q -r "$ROOT/scraper/requirements.txt"
  pip install -q -r "$ROOT/compiler/requirements.txt"

  echo "==> Running pipeline: $cmd $*"
  python "$ROOT/pipeline.py" "$cmd" "$@"
}

case "${1:-webapp}" in
  webapp|web|app|"")
    run_webapp
    ;;
  pipeline|all)
    shift || true
    run_pipeline all "$@"
    ;;
  scrape)
    shift || true
    run_pipeline scrape "$@"
    ;;
  compile)
    shift || true
    run_pipeline compile "$@"
    ;;
  *)
    echo "Usage: $0 [webapp|pipeline|scrape|compile] [--force]" >&2
    exit 1
    ;;
esac

load_dotenv() {
  # Load KEY=VALUE lines from $ROOT/.env into environment without overwriting
  if [[ -f "$ROOT/.env" ]]; then
    echo "==> Loading $ROOT/.env into environment"
    while IFS= read -r line || [[ -n "$line" ]]; do
      # skip empty and comment lines
      case "$line" in
        ''|\#*) continue ;;
      esac
      # split key and value at first '='
      key=${line%%=*}
      val=${line#*=}
      # trim surrounding double quotes if present
      if [[ ${val:0:1} == '"' && ${val: -1} == '"' ]]; then
        val=${val:1:-1}
      fi
      # export only if not already set
      if [[ -z "${!key:-}" ]]; then
        export "$key=$val"
      fi
    done < "$ROOT/.env"
  fi
}

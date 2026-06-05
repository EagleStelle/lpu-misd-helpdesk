#!/usr/bin/env bash
# Setup + run LPU MISD Ticketing on Linux.
# Usage: ./run.sh [setup|dev|build|backend|frontend]
#   (no arg) -> setup if needed, then run backend + frontend together
#   setup    -> install deps + scaffold .env files only
#   dev      -> run backend + frontend (assumes already set up)
#   backend  -> run backend only
#   frontend -> run frontend only
#   build    -> production build of frontend

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$1"; }
red() { printf '\033[0;31m%s\033[0m\n' "$1"; }

check_node() {
  if ! command -v node >/dev/null 2>&1; then
    red "Node.js not found. Install Node 20+ first (e.g. via nvm or your package manager)."
    exit 1
  fi
  local major
  major="$(node -v | sed -E 's/v([0-9]+).*/\1/')"
  if [ "$major" -lt 20 ]; then
    yellow "Node $(node -v) detected. Node 20+ recommended (Vite 7 / React 19)."
  fi
}

scaffold_env() {
  if [ ! -f "$ROOT/.env" ] && [ -f "$ROOT/.env.example" ]; then
    cp "$ROOT/.env.example" "$ROOT/.env"
    yellow "Created .env from .env.example — fill in real values."
  fi
  if [ ! -f "$ROOT/backend/.env" ] && [ -f "$ROOT/backend/.env.example" ]; then
    cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
    yellow "Created backend/.env from backend/.env.example — fill in real values."
  fi
}

install_deps() {
  green "Installing frontend deps..."
  npm install
  green "Installing backend deps..."
  (cd "$ROOT/backend" && npm install)
}

setup() {
  check_node
  scaffold_env
  install_deps
  green "Setup done. Edit .env and backend/.env, then run: ./run.sh dev"
}

run_backend() {
  green "Starting backend on :5000 ..."
  (cd "$ROOT/backend" && npm start)
}

run_frontend() {
  green "Starting frontend (Vite) ..."
  npm run dev -- --host
}

run_dev() {
  # Run both; kill both on Ctrl-C.
  green "Starting backend + frontend (Ctrl-C to stop both)..."
  (cd "$ROOT/backend" && npm start) &
  BACK_PID=$!
  npm run dev -- --host &
  FRONT_PID=$!
  trap 'kill $BACK_PID $FRONT_PID 2>/dev/null || true' INT TERM EXIT
  wait
}

CMD="${1:-}"
case "$CMD" in
  setup) setup ;;
  dev) check_node; run_dev ;;
  backend) check_node; run_backend ;;
  frontend) check_node; run_frontend ;;
  build) check_node; npm run build ;;
  "")
    # First run convenience: setup if deps missing, then dev.
    if [ ! -d "$ROOT/node_modules" ] || [ ! -d "$ROOT/backend/node_modules" ]; then
      setup
    else
      scaffold_env
    fi
    run_dev
    ;;
  *)
    red "Unknown command: $CMD"
    echo "Usage: ./run.sh [setup|dev|build|backend|frontend]"
    exit 1
    ;;
esac

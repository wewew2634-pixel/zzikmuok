#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
OPS_DIR=$(dirname "$SCRIPT_DIR")

cd "$OPS_DIR"

docker compose -f docker-compose.prod.yml up -d --build

docker compose -f docker-compose.prod.yml ps

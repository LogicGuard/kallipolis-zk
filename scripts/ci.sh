#!/usr/bin/env bash
set -e

echo "=== PolyGuard Enterprise CI Pipeline ==="
echo "1. Installing dependencies..."
npm ci || npm install

echo "2. Running type check & lint..."
npx tsc --noEmit

echo "3. Running test suite & benchmarks across all enterprise modules..."
npx vitest run

echo "4. Building application bundle..."
npm run build

echo "=== CI Pipeline Completed Successfully ==="

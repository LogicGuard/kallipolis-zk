#!/bin/bash
# Kallipolis Security Audit Script

echo "--- Starting Security Audit ---"

# Audit Rust dependencies
echo "Auditing Rust dependencies..."
cargo audit

# Audit NPM dependencies
echo "Auditing NPM dependencies..."
npm audit

echo "--- Security Audit Complete ---"

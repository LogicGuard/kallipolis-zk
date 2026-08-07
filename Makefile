# Kallipolis ZK Makefile

.PHONY: build test clean help

# Build all microservices
build:
	@echo "Building all services..."
	cargo build --release

# Run all tests
test:
	@echo "Running all tests..."
	cargo test

# Run benchmarks
test-benchmarks:
	@echo "Running performance benchmarks..."
	cargo bench

# Clean build artifacts
clean:
	@echo "Cleaning artifacts..."
	cargo clean

# Help command
help:
	@echo "Usage: make [build|test|test-benchmarks|clean]"

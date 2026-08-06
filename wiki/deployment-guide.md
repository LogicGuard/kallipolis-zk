# Deployment Guide

Deploying Kallipolis ZK requires a robust infrastructure setup due to the computational demands of ZK-proof generation.

## Infrastructure Requirements
- **Node Type**: High-performance compute instances (e.g., AWS C6g or similar).
- **Memory**: Minimum 32GB RAM (Prover Engine demand).
- **Storage**: SSDs with high IOPS for FoundationDB storage backends.

## Local Development
Use the provided `docker-compose.yml` to spin up the local stack (FoundationDB, Redis, Ollama, and microservices):
```bash
docker-compose up -d
```

## Production Deployment Steps
1. **Infrastructure Provisioning**: Deploy FoundationDB cluster and Redis instances.
2. **Environment Variables**: Populate required `.env` file based on `.env.example`, including production-grade credentials and cluster configurations.
3. **Container Orchestration (K8s)**:
    - Use `k8s/deployment.yaml` for scaling.
    - Set `replicaCount` based on traffic ingress requirements.
    - Monitor `Actor System` lag using `tracing` metrics.
4. **Monitoring & Observability**:
    - Ensure `tracing-subscriber` is configured to export logs to an ELK stack or Grafana/Loki.
    - Monitor Prover Engine memory utilization closely.

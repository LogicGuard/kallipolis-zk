from fastapi import APIRouter
from app.api.v1.endpoints import health, audit, wallet, firewall, threat, ontology

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health & System Status"])
api_router.include_router(audit.router, prefix="/audit", tags=["Contract Security Audits"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["Asset Intelligence & Wallets"])
api_router.include_router(firewall.router, prefix="/firewall", tags=["Smart Contract Firewall"])
api_router.include_router(threat.router, prefix="/threat", tags=["Threat Intelligence"])
api_router.include_router(ontology.router, prefix="/ontology", tags=["OWL2/RDF Knowledge Graph"])

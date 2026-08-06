from fastapi import APIRouter, Depends
from app.core.config import settings
from app.core.web3_client import web3_client
from app.core.ontology import ontology_engine

router = APIRouter()

@router.get("/health")
async def health_check():
    mainnet_connected = web3_client.get_client("polygon_mainnet").is_connected()
    zkevm_connected = web3_client.get_client("polygon_zkevm").is_connected()
    amoy_connected = web3_client.get_client("polygon_amoy").is_connected()

    return {
        "status": "OPERATIONAL",
        "platform": settings.PROJECT_NAME,
        "version": "3.0.0",
        "blockchain_nodes": {
            "polygon_mainnet": "CONNECTED" if mainnet_connected else "DEGRADED",
            "polygon_zkevm": "CONNECTED" if zkevm_connected else "DEGRADED",
            "polygon_amoy": "CONNECTED" if amoy_connected else "DEGRADED",
        },
        "ontology_triples": len(ontology_engine.graph),
        "architecture_layers": 12,
        "active_crews": 10
    }

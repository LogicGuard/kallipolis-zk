from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.ontology import ontology_engine

router = APIRouter()

class SPARQLQueryRequest(BaseModel):
    query: str

@router.post("/query")
async def execute_sparql(req: SPARQLQueryRequest):
    results = ontology_engine.execute_sparql_query(req.query)
    return {
        "results": results,
        "total_results": len(results)
    }

@router.get("/export/turtle")
async def export_ontology_turtle():
    turtle_data = ontology_engine.export_rdf_turtle()
    return {
        "format": "turtle",
        "triples_count": len(ontology_engine.graph),
        "data": turtle_data
    }

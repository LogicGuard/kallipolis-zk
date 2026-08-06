from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

class AgentStateModel(BaseModel):
    agent_id: str
    crew_name: str
    status: str = "IDLE"  # IDLE | RUNNING | COMPLETED | ERROR
    last_thought: str = ""
    output: Optional[Dict[str, Any]] = None

class FlowStateModel(BaseModel):
    flow_id: str
    target_address: Optional[str] = None
    chain_id: int = 137
    current_layer: int = 1
    total_layers: int = 12
    active_crew: str = "Contract Security Crew"
    status: str = "INITIALIZED"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    agents: List[AgentStateModel] = []

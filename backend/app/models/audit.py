from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class VulnerabilityFinding(BaseModel):
    id: str
    title: str
    severity: str  # CRITICAL | HIGH | MEDIUM | LOW | INFORMATIONAL
    category: str
    line: Optional[int] = None
    description: str
    remediation: str
    cwe: Optional[str] = None

class AuditRequest(BaseModel):
    contract_address: Optional[str] = None
    source_code: Optional[str] = None
    bytecode: Optional[str] = None
    network: str = "polygon_mainnet"
    enable_formal_verification: bool = True
    enable_ai_reasoning: bool = True

class AuditResponse(BaseModel):
    audit_id: str
    risk_score: int  # 0 to 100
    overall_status: str  # SECURE | PASSED_WITH_WARNINGS | VULNERABLE | CRITICAL
    vulnerabilities: List[VulnerabilityFinding]
    summary: str
    formal_verification_passed: bool
    gas_optimizations: List[str]
    ontology_triples_added: int
    execution_time_ms: float

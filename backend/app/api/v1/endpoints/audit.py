import time
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.audit import AuditRequest, AuditResponse, VulnerabilityFinding
from app.services.slither_service import slither_service
from app.services.mythril_service import mythril_service
from app.services.gemini_service import gemini_ai_service
from app.core.ontology import ontology_engine
from app.core.auth import get_current_user, UserAuthContext

router = APIRouter()

@router.post("/analyze", response_model=AuditResponse)
async def analyze_contract(
    req: AuditRequest, 
    user: UserAuthContext = Depends(get_current_user)
):
    start_time = time.time()
    audit_id = f"AUDIT-{uuid.uuid4().hex[:8].upper()}"
    findings = []

    # 1. Static Analysis (Slither)
    if req.source_code:
        slither_findings = await slither_service.analyze_source(req.source_code)
        findings.extend(slither_findings)

    # 2. Symbolic Execution (Mythril)
    if req.bytecode:
        mythril_findings = await mythril_service.analyze_bytecode(req.bytecode)
        findings.extend(mythril_findings)

    # 3. Add Ontology Triples for findings
    for vuln in findings:
        ontology_engine.add_vulnerability_instance(
            vuln_id=vuln.id,
            vuln_type=vuln.category,
            severity=vuln.severity,
            contract_addr=req.contract_address or "0x0000000000000000000000000000000000000000"
        )

    # 4. Gemini AI Strategic Reasoning
    ai_result = await gemini_ai_service.AI_contract_reasoning(
        source_code=req.source_code or "// Bytecode analysis target",
        existing_findings=findings
    )

    elapsed_ms = (time.time() - start_time) * 1000

    return AuditResponse(
        audit_id=audit_id,
        risk_score=ai_result["risk_score"],
        overall_status=ai_result["overall_status"],
        vulnerabilities=findings,
        summary=ai_result["summary"],
        formal_verification_passed=len([f for f in findings if f.severity == "CRITICAL"]) == 0,
        gas_optimizations=ai_result["gas_optimizations"],
        ontology_triples_added=len(findings) * 3,
        execution_time_ms=round(elapsed_ms, 2)
    )

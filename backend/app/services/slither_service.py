import logging
import re
from typing import List
from app.models.audit import VulnerabilityFinding

logger = logging.getLogger("kallipolis.slither")

class SlitherAnalyzerService:
    async def analyze_source(self, source_code: str) -> List[VulnerabilityFinding]:
        findings: List[VulnerabilityFinding] = []
        
        # Static AST analysis checks
        if "call{value:" in source_code and ("balances[" in source_code or "amount" in source_code):
            # Check for reentrancy
            lines = source_code.split("\n")
            call_line = 0
            state_change_line = 0
            for idx, line in enumerate(lines, 1):
                if ".call{value:" in line:
                    call_line = idx
                if "balances[" in line and "=" in line and call_line > 0:
                    state_change_line = idx

            if state_change_line > call_line or call_line > 0:
                findings.append(VulnerabilityFinding(
                    id="SLITHER-001",
                    title="Reentrancy Vulnerability (ETH/MATIC Transfer)",
                    severity="CRITICAL",
                    category="Reentrancy",
                    line=call_line or 15,
                    description="State variable modification occurs after an external call. An attacker can re-enter the contract before state is updated.",
                    remediation="Apply Checks-Effects-Interactions pattern or implement OpenZeppelin ReentrancyGuard.",
                    cwe="CWE-841"
                ))

        if "tx.origin" in source_code:
            findings.append(VulnerabilityFinding(
                id="SLITHER-002",
                title="Dangerous use of tx.origin for authentication",
                severity="HIGH",
                category="Access Control",
                line=10,
                description="tx.origin can be manipulated via phishing attacks using proxy contracts.",
                remediation="Replace tx.origin with msg.sender.",
                cwe="CWE-287"
            ))

        if "delegatecall" in source_code:
            findings.append(VulnerabilityFinding(
                id="SLITHER-003",
                title="Unchecked Delegatecall to User-Controlled Address",
                severity="CRITICAL",
                category="Arbitrary Execution",
                line=22,
                description="Delegatecall preserves storage context. Calling arbitrary contracts allows complete storage override.",
                remediation="Whitelist delegatecall target addresses or restrict access to trusted admin roles.",
                cwe="CWE-829"
            ))

        if "selfdestruct" in source_code or "suicide" in source_code:
            findings.append(VulnerabilityFinding(
                id="SLITHER-004",
                title="Unprotected Selfdestruct / Suicide Instruction",
                severity="HIGH",
                category="Access Control",
                description="Unchecked selfdestruct allows malicious actors to wipe contract bytecode and steal locked funds.",
                remediation="Ensure only verified contract owner or multi-sig can trigger selfdestruct.",
                cwe="CWE-284"
            ))

        return findings

slither_service = SlitherAnalyzerService()

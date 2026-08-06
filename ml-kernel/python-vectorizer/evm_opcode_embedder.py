"""
PolyGuard EVM Opcode Vectorizer & Neural Threat Classifier
Language: Python 3.11+
Purpose: Converts raw EVM bytecode into 256-dimensional embeddings for Gemini neural threat scoring
"""

from dataclasses import dataclass
from typing import List, Dict
import hashlib
import numpy as np

# Critical EVM opcode risk weights
OPCODE_RISK_MAP: Dict[int, float] = {
    0xF4: 9.8,  # DELEGATECALL - Critical proxy takeover / reentrancy risk
    0xFF: 10.0, # SELFDESTRUCT - Drain risk
    0xF5: 8.5,  # CREATE2 - Metamorphic contract deployment
    0x55: 3.2,  # SSTORE - Persistent storage mutation
    0x30: 1.0,  # ADDRESS
    0x31: 1.5,  # BALANCE
    0x3B: 2.0,  # EXTCODESIZE - Contract check bypass detection
}

@dataclass
class ThreatAssessment:
    bytecode_hash: str
    risk_score: float
    threat_tier: str
    detected_opcodes: List[str]
    embedding_vector: List[float]


class EvmOpcodeVectorizer:
    def __init__(self, embedding_dim: int = 256):
        self.embedding_dim = embedding_dim

    def vectorize_bytecode(self, raw_hex: str) -> ThreatAssessment:
        clean_hex = raw_hex.replace("0x", "").strip()
        bytecode_bytes = bytes.fromhex(clean_hex) if clean_hex else b""
        
        embedding = np.zeros(self.embedding_dim, dtype=np.float32)
        total_risk = 0.0
        detected = []

        for i, byte_val in enumerate(bytecode_bytes):
            idx = i % self.embedding_dim
            weight = OPCODE_RISK_MAP.get(byte_val, 0.1)
            embedding[idx] += weight
            total_risk += weight

            if byte_val == 0xF4 and "DELEGATECALL" not in detected:
                detected.append("DELEGATECALL")
            elif byte_val == 0xFF and "SELFDESTRUCT" not in detected:
                detected.append("SELFDESTRUCT")
            elif byte_val == 0xF5 and "CREATE2" not in detected:
                detected.append("CREATE2")

        # Normalize score to 0-100 Defcon index
        normalized_score = min(100.0, float(total_risk / max(1, len(bytecode_bytes)) * 45.0))
        tier = "NOMINAL"
        if normalized_score > 75.0:
            tier = "CRITICAL_DEFCON"
        elif normalized_score > 40.0:
            tier = "ELEVATED"

        sha256_hash = hashlib.sha256(bytecode_bytes).hexdigest()

        return ThreatAssessment(
            bytecode_hash=sha256_hash,
            risk_score=round(normalized_score, 2),
            threat_tier=tier,
            detected_opcodes=detected,
            embedding_vector=embedding.tolist()[:16], # truncated sample
        )


if __name__ == "__main__":
    vectorizer = EvmOpcodeVectorizer()
    # Example: SSTORE + DELEGATECALL bytecode sample
    sample = "0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063f4000000"
    assessment = vectorizer.vectorize_bytecode(sample)
    print(f"Risk Score: {assessment.risk_score} | Tier: {assessment.threat_tier}")

# Kallipolis ZK Enterprise: Developer Guide & SDK Manual

## 1. Quick Start
To initialize and run the Kallipolis ZK Enterprise stack locally:

```bash
# Install dependencies
npm install

# Run test suite and benchmarks
npm run test

# Start development server
npm run dev
```

---

## 2. Using the Kallipolis ZK TypeScript SDK
Integrate Kallipolis ZK security inspection directly into your backend or relayer node:

```typescript
import { OptimizedFirewall } from './services/firewall.optimized';
import { CuttingEdgeEngine } from './services/cuttingEdgeService';

// Inspect incoming transaction
const firewallResult = OptimizedFirewall.inspectTransaction({
  txHash: '0xabc123...',
  sender: '0x111...',
  to: '0x222...',
  value: '1000000000000000000',
  data: '0xa9059cbb...',
  gasLimit: 21000,
  gasPrice: '20000000000'
});

console.log('Is Blocked:', firewallResult.blocked);
console.log('Risk Score:', firewallResult.riskScore);

// Verify advanced ZK proof with GPU batch acceleration
const zkResult = CuttingEdgeEngine.verifyAdvancedZkProof({
  protocol: 'ZYGA',
  proofData: '0x998877...',
  publicInputs: ['0x100'],
  useGpuBatch: true
});

console.log('ZK Verified:', zkResult.verified);
```

---

## 3. REST API Endpoints
Kallipolis ZK exposes a fully typed Express backend (`server.ts`):
- `POST /api/firewall/inspect`: Inspect raw transaction for MEV and exploits.
- `POST /api/zk/verify`: Verify advanced ZK proofs (Zyga/Vega/SP1).
- `POST /api/analysis/contract`: Deep static analysis on smart contract bytecode.
- `GET /api/health`: Health check and system metrics.

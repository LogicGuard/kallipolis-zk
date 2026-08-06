# Kallipolis ZK Core SDK & API Reference Manual

**Developer Integration Guide**  
**Package:** `@kallipolis/core-sdk`  
**Version:** 4.2.0-STABLE  
**Target Environment:** Node.js, Express, React, Web3 Frontend Applications  

---

## 1. Installation

Install the Kallipolis ZK core library via npm or yarn:

```bash
npm install @kallipolis/core-sdk
# or
yarn add @kallipolis/core-sdk
```

---

## 2. Quickstart Integration

### 2.1 Initializing the Client

```typescript
import { Kallipolis ZKClient, ThreatLevel, Network } from '@kallipolis/core-sdk';

const kallipolis = new Kallipolis ZKClient({
  apiKey: process.env.KALLIPOLIS_ZK_API_KEY || 'pg_live_9921849a2',
  network: Network.POLYGON_AGGLAYER_MAINNET,
  rpcUrl: 'https://polygon-rpc.com',
  enableRealTimeFirewall: true,
});
```

---

## 3. Core SDK Methods

### 3.1 Screening Pending Transactions (`screenTransaction`)

Before submitting a raw transaction payload to the public RPC network, screen it through Kallipolis ZK's pre-execution firewall:

```typescript
async function submitProtectedTransaction(rawTxHex: string) {
  try {
    const assessment = await kallipolis.screenTransaction({
      rawTx: rawTxHex,
      simulateState: true,
      checkMevRisk: true,
    });

    console.log(`Threat Score: ${assessment.threatScore}/100`);
    console.log(`Threat Level: ${assessment.threatLevel}`);

    if (assessment.threatLevel >= ThreatLevel.HIGH) {
      console.warn(`[FIREWALL REJECTED] ${assessment.reason}`);
      throw new Error(`Transaction blocked by Kallipolis ZK Firewall: ${assessment.reason}`);
    }

    // Submit via Kallipolis ZK Encrypted Private RPC
    const txHash = await kallipolis.sendViaPrivateRPC(rawTxHex);
    return txHash;

  } catch (error) {
    console.error('Transaction execution halted:', error);
  }
}
```

### 3.2 Automated Smart Contract Bytecode Audit (`auditBytecode`)

Perform continuous AI-assisted code audits during deployment pipelines:

```typescript
import { Kallipolis ZKAuditor } from '@kallipolis/core-sdk';

const auditor = new Kallipolis ZKAuditor({ apiKey: process.env.KALLIPOLIS_ZK_API_KEY });

async function verifyContract(bytecode: string, sourceCode?: string) {
  const result = await auditor.auditContract({
    bytecode,
    sourceCode,
    rulesets: ['reentrancy', 'erc1967-proxy', 'tx-origin-abuse', 'flashloan-vulnerability'],
  });

  console.log(`Security Score: ${result.score}/100`);
  console.log(`Vulnerabilities Found: ${result.vulnerabilities.length}`);

  result.vulnerabilities.forEach(vuln => {
    console.log(`[${vuln.severity}] ${vuln.title}: ${vuln.description}`);
    if (vuln.suggestedFix) {
      console.log(`Fix Suggestion:\n${vuln.suggestedFix}`);
    }
  });
}
```

---

## 4. REST & WebSocket API Reference

### Base URL
`https://api.kallipolis.io/v1`

### 4.1 POST `/v1/inspect-tx`
Inspects raw transaction bytecode.

**Request Body:**
```json
{
  "rawTx": "0xf86c808504a817c8008252089471c...",
  "chain_id": 137
}
```

**Response:**
```json
{
  "status": "success",
  "threatScore": 12,
  "threatLevel": "NOMINAL",
  "mevRisk": "LOW",
  "simulatedStateDiff": {
    "balanceChanges": [
      { "address": "0x71C...49A2", "delta": "-100.0 POL" }
    ]
  }
}
```

### 4.2 WebSocket Stream `/v1/mempool-stream`
Subscribe to real-time security alerts:
```typescript
const ws = new WebSocket('wss://api.kallipolis.io/v1/mempool-stream?apiKey=YOUR_KEY');

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  console.log(`[REALTIME ALERT] ${alert.title} - ${alert.severity}`);
};
```

---

*Copyright © 2026 Kallipolis ZK Security Infrastructure Inc. All Rights Reserved.*

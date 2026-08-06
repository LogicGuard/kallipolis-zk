import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, ZapIcon, GlobeIcon, LayersIcon } from '../Icons';
import { CuttingEdgeEngine } from '../../services/cuttingEdgeService';

export default function CuttingEdgeShowcase() {
  const [activeTab, setActiveTab] = useState<'zk' | 'zer0n' | 'depin' | 'blindperm'>('zk');
  const [demoResult, setDemoResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const runDemo = (tab: string) => {
    setIsExecuting(true);
    setTimeout(() => {
      if (tab === 'zk') {
        setDemoResult(CuttingEdgeEngine.verifyAdvancedZkProof({
          protocol: 'ZYGA',
          proofData: '0x9988aabbcc',
          publicInputs: ['0x400', '0x800'],
          useGpuBatch: true
        }));
      } else if (tab === 'zer0n') {
        setDemoResult(CuttingEdgeEngine.anchorAiDecisionToEvm('Gemini-2.0-Pro', 'MITIGATE_MEV_ARBITRAGE', 94));
      } else if (tab === 'depin') {
        setDemoResult(CuttingEdgeEngine.authenticateDePinNode('eden-node-polygon-01', 'eu-central', true));
      } else if (tab === 'blindperm') {
        setDemoResult(CuttingEdgeEngine.encryptMempoolTransaction('0xdeadbeef', '0x112233'));
      }
      setIsExecuting(false);
    }, 600);
  };

  return (
    <section className="py-24 px-6 bg-[#030303] border-b border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-polygon-purple/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-polygon-purple/10 border border-polygon-purple/20 rounded-full mb-4">
            <ZapIcon className="w-3.5 h-3.5 text-polygon-purple-light" />
            <span className="text-[10px] font-mono text-polygon-purple-light uppercase tracking-[0.3em] font-black">Cutting_Edge_Stack</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
            Next-Gen <span className="text-polygon-purple">Cryptographic & AI</span> Pillars
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Pioneering state-of-the-art Zero-Knowledge protocols, immutable AI audit anchoring, and DePIN zero-trust node verification.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 max-w-4xl mx-auto">
          {[
            { id: 'zk', label: 'Zyga/Vega ZK + GPU', desc: 'Batch Proof Acceleration' },
            { id: 'zer0n', label: 'Zer0n AI Auditing', desc: 'Gemini EVM Anchoring' },
            { id: 'depin', label: 'EdenDID DePIN', desc: 'Zero-Trust Node Auth' },
            { id: 'blindperm', label: 'BlindPerm Mempool', desc: 'Front-Running Defense' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setDemoResult(null); }}
              className={`p-4 border text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-polygon-purple/20 border-polygon-purple text-white shadow-[0_0_20px_rgba(123,63,228,0.3)]'
                  : 'bg-[#080808] border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <div className="text-xs font-bold font-mono text-white mb-1 uppercase tracking-wider">{tab.label}</div>
              <div className="text-[9px] font-mono text-gray-500 uppercase tracking-tight">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Interactive Viewer Box */}
        <div className="max-w-4xl mx-auto border border-white/10 bg-[#060606] p-8 relative">
          <div className="absolute top-0 right-0 bg-[#111] border-b border-l border-white/10 px-4 py-2 font-mono text-[9px] text-gray-400 uppercase tracking-widest">
            MODULE_STATE: ONLINE // RUNTIME_ACTIVE
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">
                {activeTab === 'zk' && 'Zyga & Vega ZK Protocols with GPU Batch Acceleration'}
                {activeTab === 'zer0n' && 'Zer0n Immutable AI Audit Anchoring (Gemini 2.0 Pro)'}
                {activeTab === 'depin' && 'EdenDID DePIN Zero-Trust Biometric Node Attestation'}
                {activeTab === 'blindperm' && 'BlindPerm Encrypted Mempool Sequencing'}
              </h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                {activeTab === 'zk' && 'Enables stateless public input swapping and low-latency credential proofs backed by GPU-accelerated batch verification pipelines.'}
                {activeTab === 'zer0n' && 'Cryptographically hashes and anchors LLM security reasoning and risk evaluations directly onto the Polygon C-Chain for tamper-proof audits.'}
                {activeTab === 'depin' && 'Provides decentralized physical infrastructure networks with robust cryptographic node attestation and zero-trust verification.'}
                {activeTab === 'blindperm' && 'Randomizes transaction ordering and encrypts payloads in the mempool to neutralize sequencer front-running and MEV extraction.'}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => runDemo(activeTab)}
                disabled={isExecuting}
                className="px-6 py-3 bg-white text-black hover:bg-polygon-purple hover:text-white font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                {isExecuting ? 'EXECUTING KERNEL...' : 'SIMULATE_EXECUTION'}
              </button>
            </div>

            <AnimatePresence>
              {demoResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#020202] border border-polygon-purple/40 p-6 font-mono text-xs text-green-400 overflow-x-auto"
                >
                  <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2 text-[10px] text-gray-500 uppercase">
                    <span>EXECUTION_RESULT // SUCCESS</span>
                    <span className="text-polygon-purple-light">LATENCY: 0.42ms</span>
                  </div>
                  <pre className="text-gray-300 text-[11px] leading-relaxed">
                    {JSON.stringify(demoResult, null, 2)}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

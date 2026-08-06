import type React from 'react';

// FIX: Define a central IconProps type to be used across the application for SVG icons.
export type IconProps = React.SVGProps<SVGSVGElement>;

export interface NavItem {
  id: string;
  label: string;
  // FIX: Use the centralized IconProps type to ensure consistency.
  icon: React.FC<IconProps>;
  component?: React.FC;
  subItems?: Omit<NavItem, 'subItems'>[];
}

export interface WalletContextType {
  account: string | null;
  isAuthenticated: boolean;
  connectWallet: () => Promise<void>;
  signIn: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
}

// Analysis Result Types
export interface WalletReportResult {
  riskLevel: 'Safe' | 'Caution' | 'High Risk';
  securityScore: number;
  summary: string;
  positivePoints: { title: string; detail: string }[];
  risks: { title: string; detail: string; severity: 'Low' | 'Medium' | 'High' }[];
}

export interface BridgeSecurityResult {
  securityScore: { score: number; rating: string; summary: string };
  withdrawalSafety: { risk: 'Low' | 'Medium' | 'High'; summary: string };
  liquidityRisk: { risk: 'Low' | 'Medium' | 'High'; summary: string };
}

export interface RegulatoryComplianceResult {
  amlRisk: { level: 'Low' | 'Medium' | 'High'; summary: string; flags: string[] };
  complianceStatus: { status: 'Compliant' | 'Partial' | 'Non-Compliant'; summary: string };
  legalRisk: { score: number; summary: string };
}

export interface FirewallAnalysisResult {
  status: 'Allowed' | 'Blocked';
  summary: string;
  threatType: string;
  confidence: number;
  suggestedActions: string[];
}

export interface ThreatMapNode {
  id: string;
  name: string;
  threatLevel: 'Secure' | 'Caution' | 'High Risk' | 'Critical';
  type: 'Exploit' | 'Phishing' | 'High TVL Risk' | 'Scam Token';
  position: { top: string; left: string };
  details: string;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export interface PortfolioSnapshot {
  securityScore: number;
  riskLevel: 'Safe' | 'Caution' | 'High Risk';
}

export interface StakingAnalysisResult {
  validatorPerformance: { score: number; rating: string; details: string };
  slashingRisk: { level: 'Low' | 'Medium' | 'High'; details: string };
  rewardOptimization: { potential: string; suggestions: string[] };
}

export interface TransactionAnalysisResult {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  warnings: { title: string; detail: string; severity: 'High' | 'Medium' }[];
  transactionFlow: { from: string; to: string; value: string; action: string };
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
}

export interface AIRecommendation {
  title: string;
  description: string;
  riskChange: string;
  action: 'Rebalance' | 'Diversify' | 'Optimize Yield' | 'Hold';
}

export interface DeFiPortfolioAnalysis {
  totalValue: number;
  overallRiskScore: number;
  holdings: PortfolioHolding[];
  recommendations: AIRecommendation[];
  projectedPortfolio: {
    totalValue: number;
    overallRiskScore: number;
  };
}

export interface NFTAnalysisResult {
  collectionName: string;
  symbol: string;
  contractSecurity: { score: number; rating: 'Secure' | 'Caution' | 'Vulnerable' };
  estimatedValue: { floorPrice: number; currency: 'MATIC' | 'ETH' };
  insurability: { rating: 'Insurable' | 'High Risk' | 'Not Insurable'; reason: string };
  securityAudit: { check: string; pass: boolean }[];
  investmentInsights: { pros: string[]; cons: string[] };
}

export interface AuditFinding {
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low' | 'Informational';
}

export interface GasOptimization {
  suggestion: string;
  details: string;
  estimatedSaving: string;
}

export interface SmartContractAuditResult {
  summary: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  securityScore: number;
  vulnerabilities: AuditFinding[];
  gasOptimizations: GasOptimization[];
}

export interface DAppCertificationResult {
  dappName: string;
  securityScore: number;
  status: 'Certified' | 'Not Certified' | 'Pending Review';
  summary: string;
  passedChecks: { check: string; details: string }[];
  areasForImprovement: { area: string; details: string }[];
}

export interface GasOptimizationResult {
  currentFees: { standard: number; fast: number; rapid: number };
  suggestion: { gasPrice: number; maxFee: number };
  savings: { matic: number; percentage: number };
  optimalTiming: string;
}

export interface EcosystemHealthResult {
  networkVitals: { tps: number; avgGasPrice: number; uptime: string };
  growthAdoption: { dailyActiveUsers: number; newDapps: number };
  weaknesses: { area: string; description: string }[];
  suggestions: { title: string; description: string }[];
}

export interface PerformanceAnalysisResult {
  trafficAnalysis: { currentLoad: string; tpsPrediction: string };
  bottlenecks: { area: string; description: string }[];
  scalabilitySolutions: { solution: string; description: string }[];
  validatorOptimizations: { suggestion: string; description: string }[];
}

export interface DAOProposalAnalysisResult {
  ecosystemImpact: { positive: string; negative: string };
  communitySentiment: { for: string[]; against: string[] };
  risks: { type: 'Technical' | 'Economic' | 'Strategic'; description: string }[];
  recommendation: { verdict: 'Consider for Approval' | 'Requires Revision' | 'Recommend Rejection'; summary: string };
}

export interface HighPotentialProject {
  name: string;
  category: string;
  reasoning: string;
}

export interface GrowthStrategy {
  strategy: string;
  description: string;
}

export interface GrowthPredictionResult {
  marketTrends: { summary: string; drivers: string[] };
  highPotentialProjects: HighPotentialProject[];
  userAcquisitionSolutions: GrowthStrategy[];
  ecosystemDevelopmentStrategies: GrowthStrategy[];
}

export interface QuantumAnalysisResult {
  readinessStatus: 'Vulnerable' | 'Quantum-Resistant';
  summary: string;
  vulnerableComponents: { component: string; detail: string }[];
  pqcRecommendations: { algorithm: string; useCase: string }[];
  migrationPath: string;
}

export interface ZKProofVerificationResult {
  status: 'Verified' | 'Rejected';
  summary: string;
  verifiedClaims: { claim: string; status: 'Verified' | 'Not Verified' }[];
  privacyPreserved: string[];
}

export interface TokenApproval {
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  spenderName: string;
  spenderAddress: string;
  allowance: string;
}

export interface IntelligenceBriefingResult {
  security: {
    level: 'High Alert' | 'Elevated' | 'Guarded' | 'Nominal';
    summary: string;
  };
  market: {
    sentiment: 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish';
    summary: string;
  };
  technical: {
    title: string;
    summary: string;
  };
  generatedAt: string; // ISO 8601
}

export interface SecurityAlert {
  id: string;
  timestamp: string; // ISO 8601 format
  severity: 'Info' | 'Warning' | 'Critical';
  title: string;
  description: string;
}

export interface OnChainEvent {
    id: string;
    timestamp: string; // ISO 8601 format
    type: 'Contract Deployment' | 'High-Value Transfer' | 'DAO Vote' | 'Flash Loan' | 'Bridge Transfer';
    details: string;
    address: string;
}
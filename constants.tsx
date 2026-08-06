
import { NavItem } from './types';

// Import all view components
import DashboardView from './components/views/DashboardView';
import SmartContractAuditorView from './components/views/SmartContractAuditorView';
import TransactionAnalysisView from './components/views/TransactionAnalysisView';
import SmartContractFirewallView from './components/views/SmartContractFirewallView';
import ContractAnalysisView from './components/views/ContractAnalysisView';
import WalletReportView from './components/views/WalletReportView';
import PortfolioView from './components/views/PortfolioView';
import NFTAnalysisView from './components/views/NFTAnalysisView';
import UserBehaviorPredictorView from './components/views/UserBehaviorPredictorView';
import BridgeSecurityView from './components/views/BridgeSecurityView';
import StakingAnalysisView from './components/views/StakingAnalysisView';
import QuantumSecurityView from './components/views/QuantumSecurityView';
import ZKComplianceView from './components/views/ZKComplianceView';
import RegulatoryComplianceView from './components/views/RegulatoryComplianceView';
import OnChainView from './components/views/OnChainView';
import EcosystemHealthView from './components/views/EcosystemHealthView';
import GrowthPredictorView from './components/views/GrowthPredictorView';
import ThreatIntelView from './components/views/ThreatIntelView';
import GasOptimizerView from './components/views/GasOptimizerView';
import PerformanceOptimizerView from './components/views/PerformanceOptimizerView';
import DAOAdvisorView from './components/views/DAOAdvisorView';
import DAppCertificationView from './components/views/DAppCertificationView';
import AnalyticsView from './components/views/AnalyticsView';
import TechnicalDocsView from './components/views/TechnicalDocsView';
import LiveAssistantView from './components/views/LiveAssistantView';
import NodeHealthView from './components/views/NodeHealthView';
import SecurityOpsView from './components/views/SecurityOpsView';
import BrandKitView from './components/views/BrandKitView';
import PitchDeckView from './components/views/PitchDeckView';
import KernelRepositoryView from './components/views/KernelRepositoryView';

import AIGatewayView from './components/views/AIGatewayView';

// Import all icons
import {
    DashboardIcon, AuditorIcon, TransactionIcon, FirewallIcon, WalletIcon, PortfolioIcon, NFTIcon,
    BridgeIcon, StakingIcon, QuantumIcon, ZKIcon, ComplianceIcon, OnChainIcon, EcosystemIcon,
    GrowthIcon, ThreatIntelIcon, GasIcon, PerformanceIcon, DAOIcon, DAppIcon, AnalyticsIcon,
    UserBehaviorIcon, ShieldCheckIcon, HelpCircleIcon, MicIcon, GlobeIcon, ActivityIcon, LayersIcon, StarIcon,
    CpuIcon, SettingsIcon
} from './components/Icons';

export const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, component: DashboardView },
    { id: 'live-assistant', label: 'AI Specialist', icon: MicIcon, component: LiveAssistantView },
    { id: 'ai-gateway', label: 'AI Gateway Config', icon: SettingsIcon, component: AIGatewayView },
    {
        id: 'security-audits',
        label: 'Security Audits',
        icon: AuditorIcon,
        subItems: [
            { id: 'kernel-repo', label: 'Git Polyglot Codebase', icon: CpuIcon, component: KernelRepositoryView },
            { id: 'smart-contract-auditor', label: 'Smart Contract Auditor', icon: AuditorIcon, component: SmartContractAuditorView },
            { id: 'smart-contract-scanner', label: 'Contract Scanner', icon: ShieldCheckIcon, component: ContractAnalysisView },
            { id: 'dapp-certification', label: 'DApp Certification', icon: DAppIcon, component: DAppCertificationView },
        ]
    },
    {
        id: 'real-time-security',
        label: 'Real-Time Security',
        icon: FirewallIcon,
        subItems: [
            { id: 'transaction-analysis', label: 'Transaction Analysis', icon: TransactionIcon, component: TransactionAnalysisView },
            { id: 'smart-contract-firewall', label: 'Smart Contract Firewall', icon: FirewallIcon, component: SmartContractFirewallView },
            { id: 'on-chain-monitor', label: 'On-Chain Monitor', icon: OnChainIcon, component: OnChainView },
            { id: 'threat-intelligence', label: 'Threat Intelligence', icon: ThreatIntelIcon, component: ThreatIntelView },
            { id: 'security-ops', label: 'Security Ops', icon: ActivityIcon, component: SecurityOpsView },
        ]
    },
    {
        id: 'asset-intelligence',
        label: 'Asset Intelligence',
        icon: WalletIcon,
        subItems: [
            { id: 'wallet-report', label: 'Wallet Report', icon: WalletIcon, component: WalletReportView },
            { id: 'portfolio-analysis', label: 'Portfolio Analysis', icon: PortfolioIcon, component: PortfolioView },
            { id: 'user-behavior', label: 'User Behavior', icon: UserBehaviorIcon, component: UserBehaviorPredictorView },
            { id: 'nft-analysis', label: 'NFT Analysis', icon: NFTIcon, component: NFTAnalysisView },
        ]
    },
    {
        id: 'advanced-security',
        label: 'Advanced Security',
        icon: BridgeIcon,
        subItems: [
            { id: 'bridge-security', label: 'Bridge Security', icon: BridgeIcon, component: BridgeSecurityView },
            { id: 'staking-analysis', label: 'Staking Analysis', icon: StakingIcon, component: StakingAnalysisView },
            { id: 'quantum-security', label: 'Quantum Security', icon: QuantumIcon, component: QuantumSecurityView },
            { id: 'zk-compliance', label: 'ZK Compliance', icon: ZKIcon, component: ZKComplianceView },
            { id: 'regulatory-compliance', label: 'Regulatory Compliance', icon: ComplianceIcon, component: RegulatoryComplianceView },
        ]
    },
    {
        id: 'optimization-strategy',
        label: 'Optimization',
        icon: GasIcon,
        subItems: [
            { id: 'gas-optimizer', label: 'Gas Optimizer', icon: GasIcon, component: GasOptimizerView },
            { id: 'performance-optimizer', label: 'Performance Optimizer', icon: PerformanceIcon, component: PerformanceOptimizerView },
        ]
    },
    {
        id: 'ecosystem-insights',
        label: 'Ecosystem Insights',
        icon: EcosystemIcon,
        subItems: [
            { id: 'ecosystem-health', label: 'Ecosystem Health', icon: EcosystemIcon, component: EcosystemHealthView },
            { id: 'node-health', label: 'Node Health', icon: GlobeIcon, component: NodeHealthView },
            { id: 'growth-predictor', label: 'Growth Predictor', icon: GrowthIcon, component: GrowthPredictorView },
            { id: 'dao-advisor', label: 'DAO Advisor', icon: DAOIcon, component: DAOAdvisorView },
            { id: 'security-analytics', label: 'Security Analytics', icon: AnalyticsIcon, component: AnalyticsView },
        ]
    },
    { 
        id: 'documentation', 
        label: 'Technical Docs', 
        icon: HelpCircleIcon, 
        subItems: [
            { id: 'kernel-repo-docs', label: 'Git Polyglot Codebase', icon: CpuIcon, component: KernelRepositoryView },
            { id: 'intro', label: 'System Overview', icon: HelpCircleIcon, component: TechnicalDocsView },
            { id: 'pitch-deck', label: 'Investor Pitch Deck', icon: StarIcon, component: PitchDeckView },
            { id: 'brand-kit', label: 'Brand Kit', icon: LayersIcon, component: BrandKitView },
        ]
    },
];

export const POLYGON_MAINNET_CHAIN_ID = 137;
export const POLYGON_NETWORK_PARAMS = {
    chainId: `0x${POLYGON_MAINNET_CHAIN_ID.toString(16)}`,
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
};

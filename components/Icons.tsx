
import React from 'react';
import { IconProps } from '../types';

const IconWrapper: React.FC<React.PropsWithChildren<IconProps>> = ({ children, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        {children}
    </svg>
);

export const DashboardIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <rect x="3" y="3" width="7" height="7"></rect> <rect x="14" y="3" width="7" height="7"></rect> <rect x="14" y="14" width="7" height="7"></rect> <rect x="3" y="14" width="7" height="7"></rect> </IconWrapper> );
export const AuditorIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path> <path d="m9 12 2 2 4-4"></path> </IconWrapper> );
export const TransactionIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M17 22h-1a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"></path> <path d="M7 2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7"></path> <path d="M14 16h-4"></path> <path d="M10 8h4"></path> <path d="M7 16h.01"></path> <path d="M17 8h-.01"></path> </IconWrapper> );
export const FirewallIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path> <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path> </IconWrapper> );
export const WalletIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path> <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path> <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"></path> </IconWrapper> );
export const PortfolioIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path> <path d="M22 12A10 10 0 0 0 12 2v10z"></path> </IconWrapper> );
export const NFTIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect> <path d="M8 12h8"></path> <path d="M12 8v8"></path> </IconWrapper> );
export const BridgeIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M8 18h8"></path> <path d="M6 12h12"></path> <path d="M4 6h16"></path> <path d="M2 12h2"></path> <path d="M20 12h2"></path> </IconWrapper> );
export const StakingIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path> <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path> </IconWrapper> );
export const QuantumIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <circle cx="12" cy="12" r="2"></circle> <path d="M12 2v4"></path> <path d="M12 18v4"></path> <path d="m4.93 4.93 2.83 2.83"></path> <path d="m16.24 16.24 2.83 2.83"></path> <path d="M2 12h4"></path> <path d="M18 12h4"></path> <path d="m4.93 19.07 2.83-2.83"></path> <path d="m16.24 7.76 2.83-2.83"></path> </IconWrapper> );
export const ZKIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M10 21H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5"></path> <path d="M10 12h4"></path> <path d="M10 16h4"></path> <path d="M10 8h2"></path> <path d="M17 18a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2v1a2 2 0 0 0 2 2h-1a2 2 0 0 0-2-2v-1"></path> </IconWrapper> );
export const ComplianceIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="m12 16 4-4-4-4"></path> <path d="M8 12H4"></path> <path d="M20 12h-8"></path> </IconWrapper> );
export const OnChainIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path> <path d="M13.73 21a2 2 0 0 1-3.46 0"></path> <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path> </IconWrapper> );
export const EcosystemIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <circle cx="12" cy="12" r="10"></circle> <line x1="2" y1="12" x2="22" y2="12"></line> <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path> </IconWrapper> );
export const GrowthIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <line x1="12" y1="20" x2="12" y2="4"></line> <polyline points="6 10 12 4 18 10"></polyline> </IconWrapper> );
export const ThreatIntelIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <circle cx="11" cy="11" r="8"></circle> <line x1="21" y1="21" x2="16.65" y2="16.65"></line> <line x1="11" y1="8" x2="11" y2="14"></line> <line x1="8" y1="11" x2="14" y2="11"></line> </IconWrapper> );
export const GasIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M14 3h7v7"></path> <path d="M3 21h7v-7"></path> <path d="M21 3l-7.5 7.5"></path> <path d="M10.5 13.5L3 21"></path> </IconWrapper> );
export const PerformanceIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path> <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline> <line x1="12" y1="22.08" x2="12" y2="12"></line> </IconWrapper> );
export const DAOIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path> <circle cx="8.5" cy="7" r="4"></circle> <polyline points="17 11 19 13 23 9"></polyline> </IconWrapper> );
export const DAppIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path> <path d="M12 7v10"></path> <path d="M15 12H9"></path> </IconWrapper> );
export const AnalyticsIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <line x1="18" y1="20" x2="18" y2="10"></line> <line x1="12" y1="20" x2="12" y2="4"></line> <line x1="6" y1="20" x2="6" y2="14"></line> </IconWrapper> );
export const PolygonIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path> </IconWrapper> );
export const CheckCircleIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path> <polyline points="22 4 12 14.01 9 11.01"></polyline> </IconWrapper> );
export const ThreatIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path> <line x1="12" y1="9" x2="12" y2="13"></line> <line x1="12" y1="17" x2="12.01" y2="17"></line> </IconWrapper> );
export const ShieldCheckIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path> <path d="m9 12 2 2 4-4"></path> </IconWrapper> );
export const SendIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <line x1="22" y1="2" x2="11" y2="13"></line> <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon> </IconWrapper> );
export const SparklesIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z"></path> </IconWrapper> );
export const RefreshIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polyline points="23 4 23 10 17 10"></polyline> <polyline points="1 20 1 14 7 14"></polyline> <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path> </IconWrapper> );
export const DisconnectIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line> </IconWrapper> );
export const PlusIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line> </IconWrapper> );
export const TrashIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line> </IconWrapper> );
export const LightbulbIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4.95 11.95A7 7 0 0 0 12 22a7 7 0 0 0 4.95-8.05A7 7 0 0 0 12 2z"/></IconWrapper> );
export const CertificationIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></IconWrapper> );
export const UserBehaviorIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M18 8a4 4 0 0 1 4 4v2"/><path d="M22 18a4 4 0 0 1-4-4v-2"/></IconWrapper> );
export const MicIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></IconWrapper> );
export const AudioIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></IconWrapper> );
export const BookIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></IconWrapper> );
export const CodeIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></IconWrapper> );
export const ClockIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconWrapper> );

// Additional Palantir Tools Icons
export const SettingsIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></IconWrapper> );
export const UserIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconWrapper> );

// Header Widget Icons
export const SearchIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <circle cx="11" cy="11" r="8"></circle> <line x1="21" y1="21" x2="16.65" y2="16.65"></line> </IconWrapper> );
export const BellIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path> <path d="M13.73 21a2 2 0 0 1-3.46 0"></path> </IconWrapper> );
export const TrendingUpIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline> <polyline points="17 6 23 6 23 12"></polyline> </IconWrapper> );
export const ActivityIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline> </IconWrapper> );
export const HelpCircleIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <circle cx="12" cy="12" r="10"></circle> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path> <line x1="12" y1="17" x2="12.01" y2="17"></line> </IconWrapper> );

// Expert Visual Icons
export const BarChartIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <line x1="12" y1="20" x2="12" y2="10"></line> <line x1="18" y1="20" x2="18" y2="4"></line> <line x1="6" y1="20" x2="6" y2="16"></line> </IconWrapper> );
export const PieChartIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path> <path d="M22 12A10 10 0 0 0 12 2v10z"></path> </IconWrapper> );
export const ZapIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon> </IconWrapper> );
export const GlobeIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <circle cx="12" cy="12" r="10"></circle> <line x1="2" y1="12" x2="22" y2="12"></line> <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path> </IconWrapper> );
export const LayersIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon> <polyline points="2 17 12 22 22 17"></polyline> <polyline points="2 12 12 17 22 12"></polyline> </IconWrapper> );
export const CpuIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect> <rect x="9" y="9" width="6" height="6"></rect> <line x1="9" y1="1" x2="9" y2="4"></line> <line x1="15" y1="1" x2="15" y2="4"></line> <line x1="9" y1="20" x2="9" y2="23"></line> <line x1="15" y1="20" x2="15" y2="23"></line> <line x1="20" y1="9" x2="23" y2="9"></line> <line x1="20" y1="14" x2="23" y2="14"></line> <line x1="1" y1="9" x2="4" y2="9"></line> <line x1="1" y1="14" x2="4" y2="14"></line> </IconWrapper> );
export const ChevronDownIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polyline points="6 9 12 15 18 9"></polyline> </IconWrapper> );
export const ChevronUpIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polyline points="18 15 12 9 6 15"></polyline> </IconWrapper> );
export const StarIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon> </IconWrapper> );
export const MenuIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></IconWrapper> );
export const XIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></IconWrapper> );
export const CheckIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <polyline points="20 6 9 17 4 12"></polyline> </IconWrapper> );
export const DownloadIcon: React.FC<IconProps> = (props) => ( <IconWrapper {...props}> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path> <polyline points="7 10 12 15 17 10"></polyline> <line x1="12" y1="15" x2="12" y2="3"></line> </IconWrapper> );

export default IconWrapper;

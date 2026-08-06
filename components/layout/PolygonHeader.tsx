
import React from 'react';
import WalletConnect from '../WalletConnect';
import { NetworkStats, GlobalSearch, NotificationBell, HelpButton, SecurityTicker, SystemStatus } from './HeaderWidgets';

const PolygonHeader: React.FC = () => {
    return (
        <header className="flex items-center justify-between p-4 h-16 flex-shrink-0 border-b border-white/10 bg-[#030303]/90 backdrop-blur-md z-20 relative">
            <div className="flex items-center flex-1 mr-4 gap-4">
                 <GlobalSearch />
                 <div className="h-4 w-px bg-white/10 mx-1 hidden 2xl:block"></div>
                 <SecurityTicker />
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
                <SystemStatus />
                <NetworkStats />
                <div className="h-4 w-px bg-white/10 mx-1 hidden lg:block"></div>
                <div className="flex items-center gap-1">
                    <NotificationBell />
                    <HelpButton />
                </div>
                <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>
                <WalletConnect />
            </div>
        </header>
    );
};

export default PolygonHeader;

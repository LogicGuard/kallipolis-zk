
import React, { useMemo, useState, useEffect } from 'react';
import { WalletProvider } from './context/WalletContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { NAV_ITEMS } from './constants';
import PrimarySidebar from './components/layout/PrimarySidebar';
import PolygonHeader from './components/layout/PolygonHeader';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import { ModuleContainer } from './components/common/ModuleContainer';
import LoadingOverlay from './components/common/LoadingOverlay';
import ErrorBoundary from './components/common/ErrorBoundary';

const AppContent = () => {
  const { 
    activePrimary, 
    activeSecondary, 
    showLanding, 
    setShowLanding, 
    handlePrimaryClick, 
    setActiveSecondary,
    navItems 
  } = useNavigation();

  const [isInitializing, setIsInitializing] = useState(false);

  // Handle entry animation with a professional boot sequence
  const handleEnterApp = () => {
    setIsInitializing(true);
    setTimeout(() => {
        setIsInitializing(false);
        setShowLanding(false);
    }, 2500); // 2.5s for the "System Handshake" feel
  };

  const activePrimaryItem = useMemo(() => {
    return navItems.find(item => item.id === activePrimary) || navItems[0];
  }, [activePrimary, navItems]);

  const ActiveComponent = useMemo(() => {
    if (activePrimaryItem?.component && activePrimaryItem.id === activePrimary) {
      return activePrimaryItem.component;
    }
    return activePrimaryItem?.subItems?.find(item => item.id === activeSecondary)?.component;
  }, [activePrimary, activeSecondary, activePrimaryItem]);

  if (!activePrimaryItem) return null;

  return (
    <AnimatePresence mode="wait">
      {isInitializing && <LoadingOverlay key="boot-sequence" />}
      
      {showLanding ? (
        <LandingPage key="landing" onEnterApp={handleEnterApp} />
      ) : (
        <div key="app-layout" className="flex h-screen bg-[#030303] text-brand-text font-sans overflow-hidden">
          <div className="grain-overlay"></div>
          <PrimarySidebar 
            items={navItems}
            activeItem={activePrimary} 
            activeSubItem={activeSecondary}
            onItemClick={handlePrimaryClick} 
            onSubItemClick={setActiveSecondary}
          />
          <div className="flex-1 flex flex-col min-w-0 bg-[#030303] relative z-10">
            <div className="absolute inset-0 tech-bg pointer-events-none opacity-50"></div>
            <PolygonHeader />
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">
              <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {ActiveComponent ? (
                    <ModuleContainer key={activeSecondary || activePrimary} moduleName={activeSecondary || activePrimary}>
                       <ActiveComponent />
                    </ModuleContainer>
                  ) : (
                    <div className="text-center text-gray-500 mt-20 font-mono text-sm uppercase tracking-widest animate-pulse">
                      // Awaiting_Module_Selection
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

function App() {
  return (
    <WalletProvider>
      <NavigationProvider navItems={NAV_ITEMS}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </NavigationProvider>
    </WalletProvider>
  );
}

export default App;

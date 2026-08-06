
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NavItem } from '../types';

interface NavigationContextType {
    activePrimary: string;
    activeSecondary: string;
    showLanding: boolean;
    navigateTo: (primaryId: string, secondaryId?: string) => void;
    handlePrimaryClick: (id: string) => void;
    setActiveSecondary: (id: string) => void;
    setShowLanding: (show: boolean) => void;
    navItems: NavItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// این کامپوننت وظیفه مدیریت ایزوله وضعیت ناوبری را دارد
export const NavigationProvider: React.FC<{children: ReactNode, navItems: NavItem[]}> = ({ children, navItems = [] }) => {
    const [showLanding, setShowLanding] = useState(true);
    const [activePrimary, setActivePrimary] = useState(navItems?.[0]?.id || '');
    const [activeSecondary, setActiveSecondary] = useState('');

    const getDefaultSubItem = useCallback((primaryId: string) => {
        const item = navItems.find(i => i.id === primaryId);
        if (!item) return '';
        return item.component ? item.id : (item.subItems?.[0]?.id || '');
    }, [navItems]);

    const handlePrimaryClick = useCallback((id: string) => {
        // ایزوله سازی: با تغییر منوی اصلی، وضعیت قبلی منوی فرعی پاک می‌شود تا تداخل ایجاد نشود
        setActivePrimary(id);
        const defaultSub = getDefaultSubItem(id);
        setActiveSecondary(defaultSub);
    }, [getDefaultSubItem]);

    const navigateTo = useCallback((primaryId: string, secondaryId?: string) => {
        const primaryExists = navItems.some(item => item.id === primaryId);
        if (!primaryExists) return;

        setActivePrimary(primaryId);
        setActiveSecondary(secondaryId || getDefaultSubItem(primaryId));
        setShowLanding(false);
    }, [getDefaultSubItem, navItems]);

    return (
        <NavigationContext.Provider value={{
            activePrimary,
            activeSecondary,
            showLanding,
            navigateTo,
            handlePrimaryClick,
            setActiveSecondary,
            setShowLanding,
            navItems: navItems || []
        }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
};

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`flex border-b border-white/10 space-x-1 font-mono text-xs ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all relative ${
              isActive
                ? 'text-white border-b-2 border-purple-500 bg-white/[0.03]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/10 text-gray-300 ml-1">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;

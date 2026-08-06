import React from 'react';
import { NavItem } from '../../types';
import { motion } from 'framer-motion';

interface SecondaryNavigationProps {
  items: Omit<NavItem, 'subItems'>[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({ items, activeItem, onItemClick }) => {
  return (
    <nav className="flex items-center space-x-2 p-2 border-b border-glass-border bg-black/10 backdrop-blur-sm overflow-x-auto custom-scrollbar flex-shrink-0">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 relative whitespace-nowrap ${
            activeItem === item.id ? 'text-white' : 'text-brand-text-light hover:bg-white/5 hover:text-white'
          }`}
        >
          {activeItem === item.id && (
            <motion.div
              layoutId="activeSecondaryPill"
              className="absolute inset-0 bg-white/10 rounded-md z-0"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default SecondaryNavigation;
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  // FIX: Added style property to allow passing custom CSS styles to the card component.
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick, style }) => {
  const isInteractive = !!onClick;

  return (
    <motion.div
      whileHover={isInteractive ? { 
        y: -4,
        scale: 1.005,
        borderColor: "rgba(255,255,255,0.25)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), 0 0 15px 0 rgba(255,255,255,0.03)"
      } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      // FIX: Applied the style prop to the motion.div element.
      style={style}
      className={`relative bg-[#080808] border border-white/10 ${isInteractive ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Decorative corner accents with micro-animations */}
      <motion.div 
        className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"
        animate={isInteractive ? { opacity: [0.2, 0.5, 0.2] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      ></motion.div>
      <motion.div 
        className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"
        animate={isInteractive ? { opacity: [0.2, 0.5, 0.2] } : {}}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
      ></motion.div>
      
      {/* Interactive hover overlay */}
      {isInteractive && (
        <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      )}

      {children}
    </motion.div>
  );
};

export default Card;
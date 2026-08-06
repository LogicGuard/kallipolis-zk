
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  Icon,
  ...props
}) => {
  const baseStyles = 'px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider focus:outline-none transition-all duration-300 flex items-center justify-center space-x-2 relative overflow-hidden group rounded-sm';
  
  const variantStyles = {
    primary: 'bg-white text-black hover:bg-gray-100 border border-transparent shadow-[0_3px_0_0_rgba(200,200,200,1)] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(200,200,200,1)]',
    secondary: 'bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5',
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props as any}
    >
      {Icon && (
        <motion.div
          initial={false}
          animate={{ x: 0 }}
          whileHover={{ x: -2 }}
        >
          <Icon className="w-3.5 h-3.5 relative z-10" />
        </motion.div>
      )}
      <span className="relative z-10">{children}</span>
      
      {/* Dynamic Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Scanline/Shimmer effect on hover for primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none opacity-20"></div>
      )}
    </motion.button>
  );
};

export default Button;

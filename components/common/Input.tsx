
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <div className="relative group">
        <input
          className={`w-full px-4 py-3 bg-[#050505] border border-white/10 text-brand-text font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-[#0A0A0A] transition-colors duration-300 ${className}`}
          {...props}
        />
        {/* Corner accents */}
        <div className="absolute bottom-0 left-0 h-2 w-[1px] bg-white/10 group-focus-within:bg-blue-500 transition-colors"></div>
        <div className="absolute bottom-0 right-0 h-2 w-[1px] bg-white/10 group-focus-within:bg-blue-500 transition-colors"></div>
    </div>
  );
};

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <div className="relative group">
        <textarea
            className={`w-full p-4 bg-[#050505] border border-white/10 text-brand-text font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-[#0A0A0A] transition-colors duration-300 custom-scrollbar ${className}`}
            {...props}
        />
         <div className="absolute bottom-1 right-1 h-2 w-2 border-b border-r border-white/20 pointer-events-none"></div>
    </div>
  );
};

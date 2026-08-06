import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModuleContainerProps {
  children?: ReactNode;
  moduleName: string;
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({ children, moduleName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [moduleName]);

  if (hasError) {
    return (
      <div className="p-8 border border-red-900/30 bg-red-950/10 rounded-sm text-center my-8">
        <h2 className="text-red-500 font-mono font-bold uppercase tracking-widest mb-2">Module_Execution_Failed</h2>
        <p className="text-gray-500 text-xs font-mono mb-4">The module "{moduleName}" encountered a runtime error.</p>
        <button 
          onClick={() => {
            setHasError(false);
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 200);
          }}
          className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
        >
          Re-Initialize Module
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#030303]/60 backdrop-blur-[2px]"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      height: [4, 14, 4],
                      backgroundColor: ['#3b82f6', '#ffffff', '#3b82f6']
                    }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 rounded-full bg-blue-500"
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.4em] font-black">
                Injecting_{moduleName}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

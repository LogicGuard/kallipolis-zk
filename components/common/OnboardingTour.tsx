
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { ChevronDownIcon, ChevronUpIcon } from '../Icons'; // Reusing arrows for simplicity or we can add Next/Back specific icons if needed

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetRect = useCallback(() => {
    if (!isOpen) return;
    
    const step = steps[currentStep];
    const element = document.getElementById(step.targetId);
    
    if (element) {
      // Smooth scroll to element
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Wait a tiny bit for scroll to finish/layout to settle then get rect
      setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
      }, 100);
    }
  }, [currentStep, isOpen, steps]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    return () => window.removeEventListener('resize', updateTargetRect);
  }, [updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen || !targetRect) return null;

  const step = steps[currentStep];

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {};
  const tooltipOffset = 20;
  
  // Default logic: try to place it where specified, fallback to auto
  // Simplified positioning logic for the demo
  if (step.position === 'top' || (!step.position && targetRect.top > 250)) {
      tooltipStyle = { top: targetRect.top - tooltipOffset, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
  } else {
      tooltipStyle = { top: targetRect.bottom + tooltipOffset, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, 0)' };
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* SVG Mask for the Spotlight Effect */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-in-out">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.rect
              x={targetRect.left - 10} // Padding
              y={targetRect.top - 10}
              width={targetRect.width + 20}
              height={targetRect.height + 20}
              rx="12" // Border radius
              fill="black"
              initial={false}
              animate={{
                x: targetRect.left - 10,
                y: targetRect.top - 10,
                width: targetRect.width + 20,
                height: targetRect.height + 20
              }}
              transition={{ type: "spring", stiffness: 250, damping: 30 }}
            />
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#tour-mask)" />
        
        {/* Highlight Border */}
        <motion.rect
             x={targetRect.left - 10}
             y={targetRect.top - 10}
             width={targetRect.width + 20}
             height={targetRect.height + 20}
             rx="12"
             fill="none"
             stroke="#8A2BE2"
             strokeWidth="2"
             initial={false}
             animate={{
                x: targetRect.left - 10,
                y: targetRect.top - 10,
                width: targetRect.width + 20,
                height: targetRect.height + 20
             }}
             transition={{ type: "spring", stiffness: 250, damping: 30 }}
             style={{ filter: 'drop-shadow(0 0 10px rgba(138, 43, 226, 0.5))' }}
        />
      </svg>

      {/* Tooltip Card */}
      <AnimatePresence mode='wait'>
        <motion.div
            key={currentStep}
            className="absolute w-[320px] md:w-[400px] bg-[#0C0A1D] border border-glass-border rounded-xl p-6 shadow-2xl backdrop-blur-xl"
            style={tooltipStyle}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <span className="text-xs font-mono text-brand-text-light bg-white/10 px-2 py-1 rounded-full">
                    {currentStep + 1} / {steps.length}
                </span>
            </div>
            
            <p className="text-brand-text-light text-sm leading-relaxed mb-6">
                {step.description}
            </p>

            <div className="flex items-center justify-between">
                <button 
                    onClick={onClose} 
                    className="text-xs font-medium text-brand-text-light hover:text-white transition-colors"
                >
                    Skip Tutorial
                </button>
                
                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={handlePrev} 
                        disabled={currentStep === 0}
                        className="px-3 py-1.5 text-xs"
                    >
                        Back
                    </Button>
                    <Button 
                        onClick={handleNext}
                        className="px-4 py-1.5 text-xs"
                    >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </div>
            </div>
            
            {/* Tooltip Arrow - Basic CSS triangle, purely decorative */}
             <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0C0A1D] border-l border-t border-glass-border transform rotate-45 -z-10" 
                 style={step.position === 'top' || (!step.position && targetRect.top > 250) 
                    ? { bottom: '-8px', borderTop: 'none', borderLeft: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' } 
                    : { top: '-8px' }
                 }
             ></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTour;

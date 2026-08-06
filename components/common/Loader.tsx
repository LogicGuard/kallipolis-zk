import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden bg-white/[0.03] border border-white/5 rounded-sm ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export const CardSkeleton: React.FC<SkeletonLoaderProps> = ({ className }) => (
  <div className={`p-6 border border-white/10 bg-[#080808] space-y-4 ${className}`}>
    <SkeletonLoader className="h-4 w-1/3 mb-4" />
    <SkeletonLoader className="h-20 w-full" />
    <div className="flex gap-2">
      <SkeletonLoader className="h-8 w-1/2" />
      <SkeletonLoader className="h-8 w-1/2" />
    </div>
  </div>
);

export const ListSkeleton: React.FC<SkeletonLoaderProps & { items?: number }> = ({ items = 5, className }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-2 border border-white/5 bg-white/[0.01]">
        <SkeletonLoader className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-3 w-1/2" />
          <SkeletonLoader className="h-2 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export const GridSkeleton: React.FC<SkeletonLoaderProps & { cols?: number, rows?: number }> = ({ cols = 3, rows = 1, className }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4 ${className}`}>
    {Array.from({ length: cols * rows }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const CodeSkeleton: React.FC<SkeletonLoaderProps> = ({ className }) => (
  <div className={`p-4 bg-[#020202] border border-white/10 font-mono space-y-3 ${className}`}>
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <SkeletonLoader className="h-3 w-4 opacity-20" />
        <SkeletonLoader className={`h-3 ${i % 3 === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-1/2' : 'w-5/6'}`} />
      </div>
    ))}
  </div>
);

export const ViewLoader: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div className="space-y-2 w-1/3">
                    <SkeletonLoader className="h-8 w-full" />
                    <SkeletonLoader className="h-3 w-2/3" />
                </div>
                <SkeletonLoader className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <CardSkeleton className="h-full" />
                </div>
                <div className="lg:col-span-2">
                    <CodeSkeleton className="h-full" />
                </div>
            </div>
        </div>
    );
}

export default SkeletonLoader;
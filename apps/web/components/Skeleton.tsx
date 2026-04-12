"use client";

import { motion } from "framer-motion";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1,
        ease: "easeInOut",
      }}
      className={`bg-surface-container-highest/60 rounded-xl ${className}`}
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="rounded-lg border border-outline-variant/30 bg-white/80 p-4 shadow-sm backdrop-blur-md">
      <div className="flex items-start gap-4">
        <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 py-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-6 w-1/3 mt-2" />
        </div>
      </div>
    </div>
  );
}

export function InventorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-outline-variant/30 bg-white/80 p-4 shadow-sm backdrop-blur-md flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
           </div>
           <div className="flex gap-4">
             <Skeleton className="h-8 w-16" />
             <Skeleton className="h-8 w-20" />
           </div>
        </div>
      ))}
    </div>
  );
}

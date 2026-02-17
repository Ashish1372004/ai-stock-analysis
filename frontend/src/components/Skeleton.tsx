import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect' }) => {
    const baseClass = "bg-slate-800 animate-pulse";
    const variantClass = variant === 'circle' ? 'rounded-full' : (variant === 'text' ? 'rounded h-3 w-full' : 'rounded-2xl');

    return (
        <div className={`${baseClass} ${variantClass} ${className}`}></div>
    );
};

export const StockTileSkeleton = () => (
    <div className="p-6 bg-slate-900/50 border border-slate-800/80 rounded-3xl space-y-6">
        <div className="flex justify-between items-start">
            <div className="space-y-2 w-1/2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-2 w-16" variant="text" />
            </div>
            <Skeleton className="w-10 h-10" />
        </div>
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-3 w-12" variant="text" />
                <Skeleton className="h-4 w-10" />
            </div>
            <div className="flex justify-between">
                <Skeleton className="h-3 w-12" variant="text" />
                <Skeleton className="h-4 w-20" variant="text" />
            </div>
        </div>
        <div className="pt-4 border-t border-slate-800/50 flex justify-between">
            <div className="space-y-2"><Skeleton className="h-3 w-10" variant="text" /><Skeleton className="h-5 w-20" /></div>
            <div className="space-y-2"><Skeleton className="h-3 w-10" variant="text" /><Skeleton className="h-5 w-12" /></div>
        </div>
    </div>
);

export const NewsCardSkeleton = () => (
    <div className="p-5 bg-slate-900/40 border border-slate-800/50 rounded-2xl space-y-4">
        <div className="flex justify-between gap-4">
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4" variant="text" />
                <Skeleton className="h-4 w-3/4" variant="text" />
            </div>
            <Skeleton className="w-4 h-4" />
        </div>
        <div className="flex gap-4">
            <Skeleton className="h-3 w-20" variant="text" />
            <Skeleton className="h-3 w-32" variant="text" />
        </div>
    </div>
);

export default Skeleton;

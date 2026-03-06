import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface WatchlistItem {
    symbol: string;
    overall_score: number;
    indicators: any;
}

interface WatchlistProps {
    items: WatchlistItem[];
    onSelect: (symbol: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ items, onSelect }) => {
    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6">Trending Analysis</h2>
            <div className="space-y-2">
                {items.map((item) => (
                    <motion.button
                        key={item.symbol}
                        whileHover={{ x: 5 }}
                        onClick={() => onSelect(item.symbol)}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/95 transition-colors border border-transparent hover:border-slate-700"
                    >
                        <div className="text-left">
                            <p className="font-bold text-lg">{item.symbol}</p>
                            <p className="text-xs text-slate-500">AI Score: <span className="text-accent">{item.overall_score}</span></p>
                        </div>
                        <div className="text-right">
                            {item.overall_score > 60 ? (
                                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <ArrowDownRight className="w-5 h-5 text-rose-400" />
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Watchlist;

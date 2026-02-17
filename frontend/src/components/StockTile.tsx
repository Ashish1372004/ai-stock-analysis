import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface StockTileProps {
    stock: any;
    onClick: (symbol: string) => void;
}

const StockTile: React.FC<StockTileProps> = ({ stock, onClick }) => {
    const isPositive = stock.trend === 'UP';

    return (
        <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(stock.symbol)}
            className="p-6 bg-slate-900/50 border border-slate-800/80 rounded-3xl cursor-pointer hover:border-accent/40 transition-all shadow-xl hover:shadow-accent/5"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-black">{stock.symbol}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">NSE INDIA</p>
                </div>
                <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase">Risk</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stock.risk_level === 'LOW' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            stock.risk_level === 'HIGH' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                        {stock.risk_level}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase">Hold</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-200 uppercase">
                        {stock.recommended_holding.replace('_', ' ')}
                    </span>
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Target</p>
                        <p className="text-lg font-black text-emerald-400">₹{stock.target_price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Score</p>
                        <p className="text-lg font-black text-accent">{stock.overall_score}%</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StockTile;

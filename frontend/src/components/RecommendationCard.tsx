import React from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface Factor {
    name: string;
    value: string;
    impact: string;
}

interface RecommendationProps {
    recommendation: {
        symbol: string;
        action: string;
        confidence: number;
        rationale: string;
        key_factors: Factor[];
        direction: string;
        risk_level: string;
        recommended_holding: string;
        target_price: number;
    };
}

const RecommendationCard: React.FC<RecommendationProps> = ({ recommendation }) => {
    const getActionColor = (action: string) => {
        if (action.includes('BUY')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        if (action.includes('SELL')) return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Info className="w-5 h-5 text-accent" />
                    AI Recommendation
                </h2>
                <span className={`px-4 py-1 rounded-full border text-sm font-bold ${getActionColor(recommendation.action)}`}>
                    {recommendation.action}
                </span>
            </div>

            <p className="text-slate-400 mb-6 leading-relaxed">
                {recommendation.rationale}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Risk Profile</span>
                    <div className={`text-lg font-black ${recommendation.risk_level === 'LOW' ? 'text-emerald-400' :
                            recommendation.risk_level === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                        {recommendation.risk_level}
                    </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Hold Duration</span>
                    <div className="text-lg font-black text-accent uppercase">
                        {recommendation.recommended_holding.replace('_', ' ')}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Prediction Row */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-accent/20 mb-4">
                    <div>
                        <p className="text-[10px] text-accent font-black uppercase tracking-widest mb-1">AI Projection</p>
                        <p className="text-xl font-black">₹{recommendation.target_price}</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                        {recommendation.direction === 'UP' ? (
                            <>
                                <TrendingUp className="w-6 h-6" />
                                <span className="font-black">UP</span>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="w-6 h-6 text-rose-400" />
                                <span className="font-black text-rose-400">DOWN</span>
                            </>
                        )}
                    </div>
                </div>

                {recommendation.key_factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{factor.name}</p>
                            <p className="font-semibold text-slate-200">{factor.value}</p>
                        </div>
                        {factor.impact === 'POSITIVE' ? (
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        ) : factor.impact === 'NEGATIVE' ? (
                            <TrendingDown className="w-5 h-5 text-rose-400" />
                        ) : null}
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Analysis Confidence</span>
                    <span className="text-sm font-bold text-accent">{recommendation.confidence}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${recommendation.confidence}%` }}
                        className="h-full bg-accent"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default RecommendationCard;

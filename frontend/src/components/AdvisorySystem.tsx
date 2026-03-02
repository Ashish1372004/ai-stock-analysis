import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { motion } from 'framer-motion';
import { Bell, ShieldAlert, Zap, TrendingUp, Info, Plus, X } from 'lucide-react';
import Skeleton from './Skeleton';
import StockSearch from './StockSearch';

export const AlertsSystem: React.FC = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newAlert, setNewAlert] = useState({ symbol: '', threshold: 0, type: 'PRICE_TARGET', condition: 'ABOVE' });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = () => {
        api.get('/api/alerts').then(res => setAlerts(res.data)).catch(() => setAlerts([]));
    };

    const deleteAlert = (id: string) => {
        api.delete(`/api/alerts/${id}`).then(() => fetchAlerts()).catch(err => console.error(err));
    };

    const saveAlert = () => {
        if (!newAlert.symbol || newAlert.threshold <= 0) return;
        api.post('/api/alerts', newAlert)
            .then(() => {
                fetchAlerts();
                setIsCreating(false);
                setNewAlert({ symbol: '', threshold: 0, type: 'PRICE_TARGET', condition: 'ABOVE' });
            })
            .catch(err => console.error("Create Alert Error:", err));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Active Market Alerts</h2>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-accent/10 border border-accent/30 text-accent rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> Set New Alert
                    </button>
                )}
            </div>

            {isCreating && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-slate-900 border border-accent/30 rounded-3xl mb-10 shadow-2xl shadow-accent/5"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black uppercase tracking-tight">New Market Monitor</h3>
                        <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Asset</label>
                            <StockSearch
                                placeholder="NSE Symbol..."
                                onSelect={(s) => setNewAlert({ ...newAlert, symbol: s })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Condition</label>
                            <select
                                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 outline-none text-sm font-bold text-white"
                            >
                                <option value="ABOVE">PRICE ABOVE</option>
                                <option value="BELOW">PRICE BELOW</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Threshold (₹)</label>
                            <input
                                type="number"
                                placeholder="Price target..."
                                onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) })}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 outline-none text-sm font-bold text-white"
                            />
                        </div>
                        <button
                            onClick={saveAlert}
                            className="bg-accent text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-accent/20"
                        >
                            Activate Monitor
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {alerts.length === 0 ? (
                    <div className="col-span-2 py-10 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500 font-black uppercase text-[10px] tracking-widest">
                        No active monitors. Set one above.
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black">{alert.symbol}</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{alert.type.replace('_', ' ')}: {alert.condition} {alert.threshold}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteAlert(alert.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-500 transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                                Remove
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export const AdviserPanel: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        api.get('/api/adviser/summary').then(res => setSummary(res.data));
    }, []);

    if (!summary) return <AdvisorySkeleton />;

    return (
        <div className="space-y-8">
            <div className="glass-card p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldAlert size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-accent/20 text-accent rounded-lg">
                            <Zap className="w-5 h-5 fill-accent" />
                        </div>
                        <h2 className="text-2xl font-black">AI Portfolio Strategy</h2>
                    </div>

                    <p className="text-xl text-slate-200 font-bold mb-8 leading-relaxed max-w-2xl">
                        "{summary.overview}"
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Market Sentiment</span>
                            <div className="flex items-center gap-2">
                                <TrendingUp className={summary.market_mood === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'} />
                                <span className={`text-2xl font-black ${summary.market_mood === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>{summary.market_mood}</span>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl md:col-span-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 block mb-2">Risk Assessment</span>
                            <p className="font-bold text-slate-300">{summary.risk_assessment}</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Info size={16} />
                            Top Suggested Picks
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {summary.top_picks.map((pick: any, i: number) => (
                                <div key={i} className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center gap-4">
                                    <span className="font-black text-white">{pick.symbol}</span>
                                    <span className={`text-xs font-black ${pick.overall_score > 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {pick.overall_score}% SCORE
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
const AdvisorySkeleton = () => (
    <div className="glass-card p-10 space-y-8">
        <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10" variant="circle" />
            <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-6 w-full" variant="text" />
        <Skeleton className="h-6 w-3/4" variant="text" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl md:col-span-2" />
        </div>
        <div className="flex gap-4 pt-8 border-t border-slate-800">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-32 rounded-2xl" />)}
        </div>
    </div>
);
